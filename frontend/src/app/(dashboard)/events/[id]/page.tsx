'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Loader2,
    Check,
    X,
} from 'lucide-react';
import { eventsService } from '@/lib/api';
import { Event, EventRegistration } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { setCache, getCache } from '@/lib/offline-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const eventId = params.id as string;

    const [cachedEvent, setCachedEvent] = useState<Event | null>(null);

    // Load cached data
    useEffect(() => {
        getCache<Event>(`event-${eventId}`).then(setCachedEvent);
    }, [eventId]);

    // Fetch event details
    const { data: event, isLoading: isLoadingEvent } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const response = await eventsService.get<Event>(`/events/${eventId}`);
            await setCache(`event-${eventId}`, response.data);
            return response.data;
        },
        initialData: cachedEvent || undefined,
    });

    // Check if user is registered
    const { data: myRegistrations } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>('/my-events');
            return response.data;
        },
        enabled: !!session,
    });

    const userRegistration = myRegistrations?.find(
        (r) => r.eventId === eventId && r.status === 'CONFIRMED'
    );

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async () => {
            const response = await eventsService.post(`/events/${eventId}/register`, {
                userId: session?.user?.id,
                userEmail: session?.user?.email,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Inscrição realizada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erro ao realizar inscrição';
            toast.error(message);
        },
    });

    // Cancel registration mutation
    const cancelMutation = useMutation({
        mutationFn: async (registrationId: string) => {
            await eventsService.delete(`/registrations/${registrationId}`);
        },
        onSuccess: () => {
            toast.success('Inscrição cancelada');
            queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
        },
        onError: () => {
            toast.error('Erro ao cancelar inscrição');
        },
    });

    const displayEvent = event || cachedEvent;

    if (isLoadingEvent && !displayEvent) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!displayEvent) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Evento não encontrado</p>
                <Link href="/">
                    <Button variant="link">Voltar para eventos</Button>
                </Link>
            </div>
        );
    }

    const eventDate = new Date(displayEvent.eventDate);
    const isPast = eventDate < new Date();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="space-y-2">
                            <Badge variant={isPast ? 'secondary' : 'default'} className="mb-2">
                                {isPast ? 'Encerrado' : 'Aberto para inscrições'}
                            </Badge>
                            <CardTitle className="text-3xl">{displayEvent.name}</CardTitle>
                        </div>
                        {userRegistration && (
                            <Badge variant="success" className="text-sm">
                                <Check className="h-4 w-4 mr-1" />
                                Inscrito
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="text-base">
                        {displayEvent.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Data</p>
                                <p className="font-medium">{formatDate(displayEvent.eventDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Local</p>
                                <p className="font-medium">{displayEvent.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Capacidade</p>
                                <p className="font-medium">{displayEvent.maxCapacity} pessoas</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-4">
                        {!session ? (
                            <div className="w-full text-center py-4">
                                <p className="text-muted-foreground mb-4">
                                    Faça login para se inscrever neste evento
                                </p>
                                <Link href="/login">
                                    <Button>Fazer Login</Button>
                                </Link>
                            </div>
                        ) : userRegistration ? (
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <div>
                                        <p className="font-medium text-green-600 dark:text-green-400">
                                            Você está inscrito neste evento!
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Inscrito em {formatDateTime(userRegistration.registeredAt || '')}
                                        </p>
                                    </div>
                                    {!isPast && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => cancelMutation.mutate(userRegistration.id)}
                                            disabled={cancelMutation.isPending}
                                        >
                                            {cancelMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancelar Inscrição
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : !isPast ? (
                            <Button
                                size="lg"
                                onClick={() => registerMutation.mutate()}
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Inscrevendo...
                                    </>
                                ) : (
                                    'Inscrever-se'
                                )}
                            </Button>
                        ) : (
                            <p className="text-muted-foreground">
                                Este evento já foi encerrado.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
