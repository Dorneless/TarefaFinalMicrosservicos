"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { eventsService, notificationService } from "@/lib/api";
import { Event, EventRegistration } from "@/types";
import { useSync } from "@/contexts/sync-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const { data: event, isLoading, error } = useQuery({
        queryKey: ["events", params.id],
        queryFn: async () => {
            const response = await eventsService.get<Event>(`/events/${params.id}`);
            return response.data;
        },
        staleTime: 0,
        gcTime: 1000 * 60 * 60 * 24,
    });

    const { data: registrations = [] } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: async () => {
            if (!session) return [];
            const response = await eventsService.get<EventRegistration[]>("/my-events");
            return response.data;
        },
        staleTime: 0,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!session,
    });

    useEffect(() => {
        if (session && registrations.length > 0 && event) {
            const registered = registrations.some(
                (reg) => reg.eventId === event.id && reg.status !== "CANCELLED"
            );
            setIsRegistered(registered);
        }
    }, [session, registrations, event]);

    const loading = isLoading;

    const handleRegister = async () => {
        if (!session) {
            toast.error("Você precisa estar logado para se inscrever.");
            router.push("/login");
            return;
        }

        setRegistering(true);
        try {
            await eventsService.post(`/events/${event?.id}/register`, {
                userId: session.user.id,
                userEmail: session.user.email,
                userName: session.user.name,
            });

            // Send registration email
            try {
                await notificationService.post("/notifications/event-registration", {
                    name: session.user.name,
                    email: session.user.email,
                    eventName: event?.name,
                    eventDate: event?.eventDate,
                    eventLocation: event?.location,
                });
            } catch (emailError) {
                console.error("Failed to send registration email:", emailError);
            }

            toast.success("Inscrição realizada com sucesso!");
            setIsRegistered(true);
        } catch (error: any) {
            console.error("Registration failed:", error);
            const msg = error.response?.data?.message || "Falha ao se inscrever. Tente novamente.";
            toast.error(msg);
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelRegistration = async () => {
        setRegistering(true);
        try {
            const registrationsResponse = await eventsService.get<EventRegistration[]>("/my-events");
            const registration = registrationsResponse.data.find(
                (reg) => reg.eventId === event?.id && reg.status !== "CANCELLED"
            );

            if (registration) {
                await eventsService.delete(`/registrations/${registration.id}`);

                // Send cancellation email
                try {
                    await notificationService.post("/notifications/event-cancellation", {
                        name: session?.user?.name,
                        email: session?.user?.email,
                        eventName: event?.name,
                        eventDate: event?.eventDate,
                    });
                } catch (emailError) {
                    console.error("Failed to send cancellation email:", emailError);
                }

                toast.success("Inscrição cancelada.");
                setIsRegistered(false);
            }
        } catch (error: any) {
            console.error("Cancellation failed:", error);
            toast.error("Falha ao cancelar inscrição.");
        } finally {
            setRegistering(false);
        }
    };

    const [emailToRegister, setEmailToRegister] = useState("");
    const { isOnline, addToQueue } = useSync();
    const queryClient = useQueryClient();

    const handleAdminRegisterUser = async () => {
        if (!emailToRegister) {
            toast.error("Por favor, digite um email.");
            return;
        }

        setRegistering(true);

        const queueOffline = async () => {
            const tempId = crypto.randomUUID();
            const tempUser = {
                id: tempId,
                eventId: event?.id,
                userId: tempId, // Temporary
                userEmail: emailToRegister,
                userName: emailToRegister.split("@")[0], // Guess name
                registeredAt: new Date().toISOString(),
                attended: false,
                status: "CONFIRMED",
            };

            await addToQueue("REGISTER_BY_EMAIL", {
                eventId: event?.id,
                email: emailToRegister,
                tempId,
            });

            // Optimistic update for Attendance Page cache
            queryClient.setQueryData<EventRegistration[]>(["event-registrations", event?.id], (old) => {
                return [...(old || []), tempUser as EventRegistration];
            });

            toast.success("Usuário inscrito offline! Sincronize quando voltar a internet.");
            setEmailToRegister("");
        };

        if (!isOnline) {
            await queueOffline();
            setRegistering(false);
            return;
        }

        try {
            await eventsService.post(`/events/${event?.id}/register-by-email`, {
                email: emailToRegister,
            });

            // Send registration email (Admin triggered)
            try {
                // Note: We might not have the user's name if they are new or just by email.
                // We'll use the email prefix as a placeholder if name isn't returned or available.
                // The 'register-by-email' endpoint in events-service might create a user or link to existing.
                // Ideally it returns the user details. Standard post response usually creates resource.
                // Let's assume we use the email for now.
                await notificationService.post("/notifications/event-registration", {
                    name: emailToRegister.split("@")[0], // Fallback name
                    email: emailToRegister,
                    eventName: event?.name,
                    eventDate: event?.eventDate,
                    eventLocation: event?.location,
                });
            } catch (emailError) {
                console.error("Failed to send admin registration email:", emailError);
            }

            toast.success("Usuário inscrito com sucesso!");
            setEmailToRegister("");
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["event-registrations", event?.id] });
        } catch (error: any) {
            console.error("Admin registration failed:", error);
            // Check if it's a network error or server unavailable
            if (!error.response || error.code === "ERR_NETWORK" || error.response?.status >= 500) {
                console.log("Network error detected, queuing offline action...");
                await queueOffline();
            } else {
                const msg = error.response?.data?.message || "Falha ao inscrever usuário.";
                toast.error(msg);
            }
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Evento não encontrado.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Voltar para Eventos</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Voltar para Eventos
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{event.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        {event.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-3 h-5 w-5" />
                            <span className="text-lg">{format(new Date(event.eventDate), "PPP p", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-3 h-5 w-5" />
                            <span className="text-lg">{event.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Users className="mr-3 h-5 w-5" />
                            <span className="text-lg">Vagas: {event.maxCapacity}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">

                    {session?.user?.role === "ADMIN" && (
                        <div className="flex gap-2 mr-auto">
                            <Button variant="outline" asChild>
                                <Link href={`/admin/events/${event.id}/edit`}>Editar Evento</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/admin/events/${event.id}/attendance`}>Gerenciar Presença</Link>
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Inscrever Usuário</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Inscrever Usuário</DialogTitle>
                                        <DialogDescription>
                                            Digite o email do usuário. Se ele não existir, uma conta será criada.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="email" className="text-right">
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                value={emailToRegister}
                                                onChange={(e) => setEmailToRegister(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAdminRegisterUser} disabled={registering}>
                                            {registering ? "Inscrevendo..." : "Inscrever"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    {isRegistered ? (
                        <Button
                            variant="destructive"
                            onClick={handleCancelRegistration}
                            disabled={registering}
                        >
                            {registering ? "Processando..." : "Cancelar Inscrição"}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleRegister}
                            disabled={registering || !event.active}
                        >
                            {registering ? "Inscrevendo..." : event.active ? "Inscrever-se Agora" : "Evento Inativo"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
