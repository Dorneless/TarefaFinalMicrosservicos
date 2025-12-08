"use client";

import { useQuery } from "@tanstack/react-query";
import { logsApi } from "@/lib/api";
import { Log } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogsPage() {
    const { data: logs = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["system-logs"],
        queryFn: async () => {
            const response = await logsApi.get<Log[]>("/logs");
            return response.data;
        },
        staleTime: 0, // Always fetch fresh logs
    });

    const getStatusColor = (status?: number) => {
        if (!status) return "bg-gray-500";
        if (status >= 200 && status < 300) return "bg-green-500";
        if (status >= 400 && status < 500) return "bg-yellow-500";
        if (status >= 500) return "bg-red-500";
        return "bg-blue-500";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
                    <p className="text-muted-foreground">
                        Monitoramento centralizado de requisições.
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading || isRefetching}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Requisições</CardTitle>
                    <CardDescription>
                        Visualizando os últimos logs registrados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data/Hora</TableHead>
                                        <TableHead>Serviço</TableHead>
                                        <TableHead>Método</TableHead>
                                        <TableHead>Path</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Nenhum log encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>{log.service}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{log.method}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={log.path}>
                                                    {log.path}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(log.statusCode)}>
                                                        {log.statusCode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{log.userEmail}</TableCell>
                                                <TableCell>{log.ip}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
