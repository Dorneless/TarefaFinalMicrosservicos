"use client";

import { useEffect, useState } from "react";
import { eventsService } from "@/lib/api";
import { EventRegistration } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarCheck, XCircle } from "lucide-react";

export default function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await eventsService.get<EventRegistration[]>("/my-events");
            setRegistrations(response.data);
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
            toast.error("Failed to load registrations.");
        } finally {
            setLoading(false);
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
                <h1 className="text-3xl font-bold tracking-tight">My Registrations</h1>
                <p className="text-muted-foreground">
                    View your event registrations and attendance status.
                </p>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You have no registrations yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {registrations.map((reg) => (
                        <Card key={reg.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{reg.eventName}</CardTitle>
                                    {reg.attended ? (
                                        <Badge className="bg-green-500">Attended</Badge>
                                    ) : (
                                        <Badge variant="outline">Registered</Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Registered on {format(new Date(reg.registeredAt || new Date()), "PPP")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {reg.attended ? <CalendarCheck className="h-4 w-4 text-green-500" /> : <CalendarCheck className="h-4 w-4" />}
                                    <span>Status: {reg.attended ? "Confirmed" : "Pending Attendance"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
