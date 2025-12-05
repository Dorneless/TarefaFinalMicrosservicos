"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api";
import { EventRegistration } from "@/types";
import { useSync } from "@/contexts/sync-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ManageAttendancePage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const [processing, setProcessing] = useState<string | null>(null);
    const { isOnline, addToQueue } = useSync();

    const { data: registrations = [], isLoading: loading } = useQuery({
        queryKey: ["event-registrations", params.id],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>(`/events/${params.id}/registrations`);
            return response.data;
        },
        enabled: !!params.id,
    });

    const handleMarkAttendance = async (registrationId: string, attended: boolean) => {
        setProcessing(registrationId);

        const queueOffline = async () => {
            await addToQueue("MARK_ATTENDANCE", {
                registrationId,
                attended,
            });

            // Update cache optimistically
            queryClient.setQueryData<EventRegistration[]>(["event-registrations", params.id], (old) => {
                if (!old) return [];
                return old.map((reg) =>
                    reg.id === registrationId ? { ...reg, attended } : reg
                );
            });

            toast.success("Presença salva offline! Sincronize quando voltar a internet.");
        };

        if (!isOnline) {
            await queueOffline();
            setProcessing(null);
            return;
        }

        try {
            await eventsService.post(`/registrations/${registrationId}/attendance`, {
                attended,
            });

            // Update cache
            queryClient.setQueryData<EventRegistration[]>(["event-registrations", params.id], (old) => {
                if (!old) return [];
                return old.map((reg) =>
                    reg.id === registrationId ? { ...reg, attended } : reg
                );
            });

            toast.success(`Presença ${attended ? "confirmada" : "revogada"}.`);

        } catch (error: any) {
            console.error("Failed to mark attendance:", error);
            if (!error.response || error.code === "ERR_NETWORK" || error.response?.status >= 500) {
                console.log("Network error detected, queuing offline action...");
                await queueOffline();
            } else {
                toast.error("Falha ao atualizar presença.");
            }
        } finally {
            setProcessing(null);
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
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <Link href={`/events/${params.id}`} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Voltar para o Evento
                </Link>
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Presença</h1>
                <p className="text-muted-foreground">
                    Confirmar presença para usuários inscritos.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inscrições</CardTitle>
                    <CardDescription>Lista de usuários inscritos neste evento</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Data de Inscrição</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-medium">{reg.userName}</TableCell>
                                    <TableCell>{reg.userEmail}</TableCell>
                                    <TableCell>{format(new Date(reg.registeredAt || new Date()), "PPP", { locale: ptBR })}</TableCell>
                                    <TableCell>
                                        {reg.attended ? (
                                            <Badge className="bg-green-500">Presente</Badge>
                                        ) : (
                                            <Badge variant="outline">Inscrito</Badge>
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
                                                Revogar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAttendance(reg.id, true)}
                                                disabled={processing === reg.id}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                Confirmar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {registrations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        Nenhuma inscrição encontrada.
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
