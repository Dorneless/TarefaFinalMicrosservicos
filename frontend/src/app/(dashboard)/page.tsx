'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { eventsService } from '@/lib/api';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';
import { setCache, getCache } from '@/lib/offline-store';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CACHE_KEY = 'events-list';

export default function DashboardPage() {
    const [cachedEvents, setCachedEvents] = useState<Event[] | null>(null);

    // Load cached data on mount
    useEffect(() => {
        getCache<Event[]>(CACHE_KEY).then(setCachedEvents);
    }, []);

    const { data: events, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await eventsService.get<Event[]>('/events/upcoming');
            // Cache the data for offline use
            await setCache(CACHE_KEY, response.data);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        initialData: cachedEvents || undefined,
    });

    const displayEvents = events || cachedEvents;

    if (isLoading && !displayEvents) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Carregando eventos...</p>
                </div>
            </div>
        );
    }

    if (error && !displayEvents) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Erro ao carregar eventos.</p>
                    <p className="text-sm text-muted-foreground">
                        Verifique sua conexão e tente novamente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
                <p className="text-muted-foreground">
                    Confira os próximos eventos disponíveis para inscrição
                </p>
            </div>

            {!displayEvents || displayEvents.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum evento disponível</h3>
                        <p className="text-muted-foreground">
                            Novos eventos serão exibidos aqui quando estiverem disponíveis.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

function EventCard({ event }: { event: Event }) {
    const eventDate = new Date(event.eventDate);
    const isPast = eventDate < new Date();

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                    <Badge variant={isPast ? 'secondary' : 'default'}>
                        {isPast ? 'Encerrado' : 'Aberto'}
                    </Badge>
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {event.name}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                    {event.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Capacidade: {event.maxCapacity} pessoas</span>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-primary/90">
                        Ver Detalhes
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
