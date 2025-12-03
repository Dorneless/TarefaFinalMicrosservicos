"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventsService } from "@/lib/api";
import { Event, EventRegistration } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEventDetails();
        }
    }, [params.id, session]);

    const fetchEventDetails = async () => {
        try {
            const eventId = params.id as string;
            const [eventResponse, registrationsResponse] = await Promise.all([
                eventsService.get<Event>(`/events/${eventId}`),
                session ? eventsService.get<EventRegistration[]>("/my-events") : Promise.resolve({ data: [] }),
            ]);

            setEvent(eventResponse.data);

            if (session && registrationsResponse.data) {
                const registered = registrationsResponse.data.some(
                    (reg) => reg.eventId === eventId && reg.status !== "CANCELLED"
                );
                setIsRegistered(registered);
            }
        } catch (error) {
            console.error("Failed to fetch event details:", error);
            toast.error("Failed to load event details.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!session) {
            toast.error("You must be logged in to register.");
            router.push("/login");
            return;
        }

        setRegistering(true);
        try {
            await eventsService.post(`/events/${event?.id}/register`, {});
            toast.success("Successfully registered for the event!");
            setIsRegistered(true);
        } catch (error: any) {
            console.error("Registration failed:", error);
            const msg = error.response?.data?.message || "Failed to register. Please try again.";
            toast.error(msg);
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelRegistration = async () => {
        // To cancel, we need the registration ID.
        // We need to fetch my registrations again to find the ID or store it.
        // For simplicity, let's just show a message or implement it fully.
        // Let's implement it fully.
        setRegistering(true);
        try {
            const registrationsResponse = await eventsService.get<EventRegistration[]>("/my-events");
            const registration = registrationsResponse.data.find(
                (reg) => reg.eventId === event?.id && reg.status !== "CANCELLED"
            );

            if (registration) {
                await eventsService.delete(`/registrations/${registration.id}`);
                toast.success("Registration cancelled.");
                setIsRegistered(false);
            }
        } catch (error: any) {
            console.error("Cancellation failed:", error);
            toast.error("Failed to cancel registration.");
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
                <p className="text-muted-foreground text-lg">Event not found.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Back to Events</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Events
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{event.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        {event.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-3 h-5 w-5" />
                            <span className="text-lg">{format(new Date(event.date), "PPP p")}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-3 h-5 w-5" />
                            <span className="text-lg">{event.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Users className="mr-3 h-5 w-5" />
                            <span className="text-lg">Max Participants: {event.maxParticipants}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    {session?.user?.role === "ADMIN" && (
                        <div className="flex gap-2 mr-auto">
                            <Button variant="outline" asChild>
                                <Link href={`/admin/events/${event.id}/edit`}>Edit Event</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/admin/events/${event.id}/attendance`}>Manage Attendance</Link>
                            </Button>
                        </div>
                    )}
                    {isRegistered ? (
                        <Button
                            variant="destructive"
                            onClick={handleCancelRegistration}
                            disabled={registering}
                        >
                            {registering ? "Processing..." : "Cancel Registration"}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleRegister}
                            disabled={registering || !event.active}
                        >
                            {registering ? "Registering..." : event.active ? "Register Now" : "Event Inactive"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
