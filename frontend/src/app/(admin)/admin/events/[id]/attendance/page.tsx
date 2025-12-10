'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Users,
    UserPlus,
    Check,
    X,
    Loader2,
    ArrowLeft,
    Mail,
    Search,
} from 'lucide-react';
import { eventsService } from '@/lib/api';
import { Event, EventRegistration } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingAction, setCache, getCache } from '@/lib/offline-store';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

const addUserSchema = z.object({
    email: z.string().email('Email inválido'),
});

type AddUserForm = z.infer<typeof addUserSchema>;

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const eventId = params.id as string;
    const isOnline = useOnlineStatus();
    const { refresh: refreshPending } = usePendingActions();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cachedRegistrations, setCachedRegistrations] = useState<EventRegistration[] | null>(null);
    const [localRegistrations, setLocalRegistrations] = useState<EventRegistration[]>([]);

    const CACHE_KEY = `event-${eventId}-registrations`;

    // Load cached data
    useEffect(() => {
        getCache<EventRegistration[]>(CACHE_KEY).then((cached) => {
            if (cached) {
                setCachedRegistrations(cached);
                setLocalRegistrations(cached);
            }
        });
    }, [eventId]);

    // Fetch event details
    const { data: event, isLoading: isLoadingEvent } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const response = await eventsService.get<Event>(`/events/${eventId}`);
            return response.data;
        },
    });

    // Fetch registrations
    const { data: registrations, isLoading: isLoadingRegistrations } = useQuery({
        queryKey: ['event-registrations', eventId],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>(
                `/events/${eventId}/registrations`
            );
            await setCache(CACHE_KEY, response.data);
            setLocalRegistrations(response.data);
            return response.data;
        },
        initialData: cachedRegistrations || undefined,
    });

    const form = useForm<AddUserForm>({
        resolver: zodResolver(addUserSchema),
        defaultValues: { email: '' },
    });

    const displayRegistrations = localRegistrations.length > 0
        ? localRegistrations
        : registrations || cachedRegistrations || [];

    const filteredRegistrations = displayRegistrations.filter(
        (reg) =>
            reg.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddUser = async (data: AddUserForm) => {
        setIsAddingUser(true);
        try {
            if (isOnline) {
                const response = await eventsService.post<EventRegistration>(
                    `/events/${eventId}/register-by-email`,
                    { email: data.email }
                );
                // Update local state immediately
                setLocalRegistrations((prev) => [...prev, response.data]);
                await setCache(CACHE_KEY, [...localRegistrations, response.data]);
                queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
                toast.success('Usuário adicionado com sucesso!');
            } else {
                // Create optimistic registration
                const optimisticReg: EventRegistration = {
                    id: `offline-${generateId()}`,
                    eventId,
                    userId: '',
                    userEmail: data.email,
                    userName: data.email,
                    registeredAt: new Date().toISOString(),
                    attended: false,
                    status: 'CONFIRMED',
                };

                // Update local state
                const updated = [...localRegistrations, optimisticReg];
                setLocalRegistrations(updated);
                await setCache(CACHE_KEY, updated);

                // Add to pending actions
                await addPendingAction(
                    'REGISTER_USER_TO_EVENT',
                    { eventId, email: data.email },
                    `Adicionar ${data.email} ao evento`,
                    { eventId }
                );
                await refreshPending();

                toast.info('Usuário será adicionado quando você estiver online');
            }

            form.reset();
            setIsDialogOpen(false);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao adicionar usuário';
            toast.error(message);
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleToggleAttendance = async (registration: EventRegistration) => {
        const newAttended = !registration.attended;

        try {
            if (isOnline) {
                await eventsService.post(`/registrations/${registration.id}/attendance`, {
                    attended: newAttended,
                });
                queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
            } else {
                // Optimistic update
                const updated = localRegistrations.map((r) =>
                    r.id === registration.id ? { ...r, attended: newAttended } : r
                );
                setLocalRegistrations(updated);
                await setCache(CACHE_KEY, updated);

                // Add to pending actions (only if not an offline-created registration)
                if (!registration.id.startsWith('offline-')) {
                    await addPendingAction(
                        'MARK_ATTENDANCE',
                        { registrationId: registration.id, attended: newAttended },
                        `Marcar ${newAttended ? 'presença' : 'ausência'}: ${registration.userEmail}`,
                        { eventId, registrationId: registration.id }
                    );
                    await refreshPending();
                }
            }

            toast.success(
                newAttended ? 'Presença marcada!' : 'Presença desmarcada'
            );
        } catch (error) {
            toast.error('Erro ao atualizar presença');
        }
    };

    const isLoading = isLoadingEvent || isLoadingRegistrations;

    if (isLoading && !displayRegistrations.length) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>

            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gerenciar Presenças
                    </h1>
                    {event && (
                        <p className="text-muted-foreground">
                            {event.name}
                        </p>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Usuário ao Evento</DialogTitle>
                            <DialogDescription>
                                Informe o email do usuário. Se não existir, será criado automaticamente.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleAddUser)}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email do Usuário</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="usuario@email.com"
                                            className="pl-10"
                                            {...form.register('email')}
                                        />
                                    </div>
                                    {form.formState.errors.email && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isAddingUser}>
                                    {isAddingUser ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Adicionar'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Inscritos</CardTitle>
                            <CardDescription>
                                {displayRegistrations.length} usuário(s) inscrito(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por email ou nome..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredRegistrations.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum inscrito'}
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                                {filteredRegistrations.map((registration) => (
                                    <div
                                        key={registration.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {registration.userName || registration.userEmail}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {registration.userEmail}
                                            </p>
                                            {registration.registeredAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    Inscrito em {formatDateTime(registration.registeredAt)}
                                                </p>
                                            )}
                                            {registration.id.startsWith('offline-') && (
                                                <Badge variant="warning" className="text-xs">
                                                    Pendente de sincronização
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={registration.attended ? 'success' : 'secondary'}
                                            >
                                                {registration.attended ? (
                                                    <>
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Presente
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-3 w-3 mr-1" />
                                                        Ausente
                                                    </>
                                                )}
                                            </Badge>
                                            <Button
                                                variant={registration.attended ? 'outline' : 'default'}
                                                size="sm"
                                                onClick={() => handleToggleAttendance(registration)}
                                                disabled={registration.id.startsWith('offline-')}
                                            >
                                                {registration.attended ? 'Desmarcar' : 'Marcar Presença'}
                                            </Button>
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
