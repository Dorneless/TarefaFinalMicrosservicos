"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { eventsService, certificateApi } from "@/lib/api";
import axios from "axios";
import { EventRegistration } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarCheck, XCircle, Download } from "lucide-react";

export default function MyRegistrationsPage() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [cancelling, setCancelling] = useState<string | null>(null);

    const { data: registrations = [], isLoading: loading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>("/my-events");
            return response.data;
        },
    });

    const handleGenerateCertificate = async (eventId: string) => {
        try {
            const response = await certificateApi.post(
                "/certificates/issue",
                { eventId },
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `certificado-${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Certificado gerado com sucesso!");
        } catch (error) {
            console.error("Failed to generate certificate:", error);
            toast.error("Falha ao gerar certificado.");
        }
    };

    const handleCancelRegistration = async (registrationId: string) => {
        setCancelling(registrationId);
        try {
            await eventsService.delete(`/registrations/${registrationId}`);

            // Send cancellation email
            const canceledReg = registrations.find(r => r.id === registrationId);
            if (canceledReg && session?.user) {
                try {
                    await axios.post("http://177.44.248.107:8082/api/notifications/event-cancellation", {
                        name: session.user.name,
                        email: session.user.email,
                        eventName: canceledReg.eventName,
                        eventDate: new Date().toISOString() // Or available date
                    });
                } catch (emailError) {
                    console.error("Failed to send cancellation email:", emailError);
                }
            }

            toast.success("Inscrição cancelada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
        } catch (error) {
            console.error("Failed to cancel registration:", error);
            toast.error("Falha ao cancelar inscrição.");
        } finally {
            setCancelling(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minhas Inscrições</h1>
                <p className="text-muted-foreground">
                    Veja suas inscrições em eventos e status de presença.
                </p>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Você ainda não tem inscrições.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {registrations.map((reg) => (
                        <Card key={reg.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{reg.eventName}</CardTitle>
                                    {reg.attended ? (
                                        <Badge className="bg-green-500">Presente</Badge>
                                    ) : (
                                        <Badge variant="outline">Inscrito</Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Inscrito em {format(new Date(reg.registeredAt || new Date()), "PPP", { locale: ptBR })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {reg.attended ? <CalendarCheck className="h-4 w-4 text-green-500" /> : <CalendarCheck className="h-4 w-4" />}
                                    <span>Status: {reg.attended ? "Confirmado" : "Presença Pendente"}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Button
                                    className="w-full"
                                    disabled={!reg.attended}
                                    onClick={() => handleGenerateCertificate(reg.eventId)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {reg.attended ? "Gerar Certificado" : "Aguardando Presença"}
                                </Button>
                                {!reg.attended && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        disabled={cancelling === reg.id}
                                        onClick={() => handleCancelRegistration(reg.id)}
                                    >
                                        {cancelling === reg.id ? "Cancelando..." : "Cancelar Inscrição"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
