'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    Plus,
    Edit,
    Users,
    Loader2,
    MapPin,
    MoreHorizontal,
} from 'lucide-react';
import { eventsService } from '@/lib/api';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CACHE_KEY = 'admin-events-list';

export default function AdminEventsPage() {
    const [cachedEvents, setCachedEvents] = useState<Event[] | null>(null);

    useEffect(() => {
        getCache<Event[]>(CACHE_KEY).then(setCachedEvents);
    }, []);

    const { data: events, isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: async () => {
            const response = await eventsService.get<Event[]>('/events');
            await setCache(CACHE_KEY, response.data);
            return response.data;
        },
        initialData: cachedEvents || undefined,
    });

    const displayEvents = events || cachedEvents;

    if (isLoading && !displayEvents) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciar Eventos</h1>
                    <p className="text-muted-foreground">
                        Crie, edite e gerencie eventos do sistema
                    </p>
                </div>
                <Link href="/admin/events/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Evento
                    </Button>
                </Link>
            </div>

            {!displayEvents || displayEvents.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum evento</h3>
                        <p className="text-muted-foreground mb-4">
                            Crie seu primeiro evento para começar.
                        </p>
                        <Link href="/admin/events/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Evento
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {displayEvents.map((event) => (
                        <EventRow key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

function EventRow({ event }: { event: Event }) {
    const eventDate = new Date(event.eventDate);
    const isPast = eventDate < new Date();

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{event.name}</CardTitle>
                            <Badge variant={isPast ? 'secondary' : event.active ? 'default' : 'outline'}>
                                {isPast ? 'Encerrado' : event.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                        <CardDescription className="line-clamp-1">
                            {event.description}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}/edit`} className="flex items-center">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/admin/events/${event.id}/attendance`}
                                    className="flex items-center"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Gerenciar Presenças
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Capacidade: {event.maxCapacity}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
