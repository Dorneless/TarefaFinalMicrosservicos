'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Search, Filter } from 'lucide-react';
import { logsService } from '@/lib/api';
import { Log } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { setCache, getCache } from '@/lib/offline-store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const CACHE_KEY = 'admin-logs';

export default function AdminLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState<string>('all');
    const [cachedLogs, setCachedLogs] = useState<Log[] | null>(null);

    useEffect(() => {
        getCache<Log[]>(CACHE_KEY).then(setCachedLogs);
    }, []);

    const { data: logs, isLoading } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: async () => {
            const response = await logsService.get<Log[]>('/logs');
            await setCache(CACHE_KEY, response.data);
            return response.data;
        },
        initialData: cachedLogs || undefined,
    });

    const displayLogs = logs || cachedLogs || [];

    // Get unique services
    const services = Array.from(new Set(displayLogs.map((log) => log.service)));

    // Filter logs
    const filteredLogs = displayLogs.filter((log) => {
        const matchesSearch =
            searchQuery === '' ||
            log.path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.method?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesService =
            serviceFilter === 'all' || log.service === serviceFilter;

        return matchesSearch && matchesService;
    });

    const getStatusColor = (statusCode?: number) => {
        if (!statusCode) return 'secondary';
        if (statusCode >= 200 && statusCode < 300) return 'success';
        if (statusCode >= 400 && statusCode < 500) return 'warning';
        if (statusCode >= 500) return 'destructive';
        return 'secondary';
    };

    const getMethodColor = (method: string) => {
        switch (method.toUpperCase()) {
            case 'GET':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'POST':
                return 'bg-green-500/10 text-green-600 dark:text-green-400';
            case 'PUT':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
            case 'DELETE':
                return 'bg-red-500/10 text-red-600 dark:text-red-400';
            default:
                return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
        }
    };

    if (isLoading && !displayLogs.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
                <p className="text-muted-foreground">
                    Visualize as requisições e atividades do sistema
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Registros</CardTitle>
                            <CardDescription>
                                {filteredLogs.length} log(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por path, email..."
                                    className="pl-10 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {services.map((service) => (
                                        <SelectItem key={service} value={service}>
                                            {service}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhum log encontrado</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-2">
                                {filteredLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-mono font-medium ${getMethodColor(
                                                        log.method
                                                    )}`}
                                                >
                                                    {log.method}
                                                </span>
                                                <code className="text-sm font-mono">{log.path}</code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {log.statusCode && (
                                                    <Badge variant={getStatusColor(log.statusCode)}>
                                                        {log.statusCode}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline">{log.service}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span>{formatDateTime(log.timestamp)}</span>
                                            {log.userEmail && <span>👤 {log.userEmail}</span>}
                                            {log.ip && <span>📍 {log.ip}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
