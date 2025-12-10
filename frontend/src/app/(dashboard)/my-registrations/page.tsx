'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardList, Calendar, MapPin, Check, X, Loader2 } from 'lucide-react';
import { eventsService } from '@/lib/api';
import { EventRegistration, Event } from '@/types';
import { formatDate } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyRegistrationsPage() {
    const { data: registrations, isLoading } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>('/my-events');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Minhas Inscrições</h1>
                <p className="text-muted-foreground">
                    Acompanhe seus eventos e status de participação
                </p>
            </div>

            {!registrations || registrations.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma inscrição</h3>
                        <p className="text-muted-foreground mb-4">
                            Você ainda não se inscreveu em nenhum evento.
                        </p>
                        <Link href="/">
                            <Button>Ver Eventos Disponíveis</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {registrations.map((registration) => (
                        <RegistrationCard key={registration.id} registration={registration} />
                    ))}
                </div>
            )}
        </div>
    );
}

function RegistrationCard({ registration }: { registration: EventRegistration }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">
                            {registration.eventName || 'Evento'}
                        </CardTitle>
                        <CardDescription>
                            Inscrito em {formatDate(registration.registeredAt || '')}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={registration.status === 'CONFIRMED' ? 'default' : 'destructive'}>
                            {registration.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado'}
                        </Badge>
                        {registration.attended && (
                            <Badge variant="success">
                                <Check className="h-3 w-3 mr-1" />
                                Presença Confirmada
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    <Link href={`/events/${registration.eventId}`}>
                        <Button variant="outline" size="sm">
                            Ver Evento
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
