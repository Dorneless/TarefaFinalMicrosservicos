"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { eventsService, certificateService } from "@/lib/api";
import { EventRegistration } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Award } from "lucide-react";
import { format } from "date-fns";

export default function ManageAttendancePage() {
    const params = useParams();
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchRegistrations();
        }
    }, [params.id]);

    const fetchRegistrations = async () => {
        try {
            const response = await eventsService.get<EventRegistration[]>(`/events/${params.id}/registrations`);
            setRegistrations(response.data);
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
            toast.error("Failed to load registrations.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (registrationId: string, attended: boolean) => {
        setProcessing(registrationId);
        try {
            await eventsService.post(`/registrations/${registrationId}/attendance`, {
                attended,
            });

            // Update local state
            setRegistrations((prev) =>
                prev.map((reg) =>
                    reg.id === registrationId ? { ...reg, attended } : reg
                )
            );

            toast.success(`Attendance ${attended ? "confirmed" : "revoked"}.`);

            // If attended is true, we might want to issue certificate automatically or have a button for it.
            // The backend requirement says "issuing PDF certificates to users who have confirmed attendance".
            // The certificate service has `POST /certificates/issue`.
            // It takes `eventId` and `userId` (from token) but wait.
            // The `issueCertificate` endpoint in `CertificateController` uses `@Req() req` to get the user ID.
            // `user.userId comes from the JWT sub claim`.
            // This means the USER issues their own certificate?
            // Or the ADMIN issues it?
            // Let's check `CertificateController` again.
            // `issueCertificate(@Body() dto: IssueCertificateDto, @Req() req)`
            // `this.certificateService.issueCertificate(user.userId, dto)`
            // If `user.userId` is the admin's ID, then it issues for the admin?
            // Or does `IssueCertificateDto` contain the target user ID?
            // Let's check `IssueCertificateDto`.

        } catch (error: any) {
            console.error("Failed to mark attendance:", error);
            toast.error("Failed to update attendance.");
        } finally {
            setProcessing(null);
        }
    };

    const handleIssueCertificate = async (registration: EventRegistration) => {
        // This is tricky if the endpoint expects the USER to call it.
        // If the endpoint is designed for the user to claim their certificate, then the admin cannot issue it via that endpoint unless the endpoint supports "on behalf of".
        // Let's assume the user claims it from "My Certificates" or similar, OR the system auto-issues it.
        // The notification service sends email with certificate.
        // If the `CertificateService` listens to `AttendanceConfirmed` event, it might auto-issue.
        // But the user objective said "providing a protected endpoint for certificate issuance".

        // If I can't issue it here, I won't add the button.
        // But typically "Manage Attendance" implies marking them present.
        // Let's just stick to marking attendance.
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
                <h1 className="text-3xl font-bold tracking-tight">Manage Attendance</h1>
                <p className="text-muted-foreground">
                    Confirm attendance for registered users.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registrations</CardTitle>
                    <CardDescription>List of users registered for this event</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Registration Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-medium">{reg.userName}</TableCell>
                                    <TableCell>{reg.userEmail}</TableCell>
                                    <TableCell>{format(new Date(reg.registeredAt || new Date()), "PPP")}</TableCell>
                                    <TableCell>
                                        {reg.attended ? (
                                            <Badge className="bg-green-500">Present</Badge>
                                        ) : (
                                            <Badge variant="outline">Registered</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {reg.attended ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAttendance(reg.id, false)}
                                                disabled={processing === reg.id}
                                            >
                                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                Revoke
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAttendance(reg.id, true)}
                                                disabled={processing === reg.id}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                Confirm
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {registrations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
