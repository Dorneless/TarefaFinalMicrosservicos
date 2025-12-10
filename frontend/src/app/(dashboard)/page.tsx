"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/lib/api";
import { Event } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OfflinePreloader } from "@/components/offline-preloader";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

    const { data: events = [], isLoading: loading, isError } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const response = await eventsService.get<Event[]>("/events");
            return response.data;
        },
        staleTime: 0, // Always try to fetch fresh data
        gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24h
    });

    useEffect(() => {
        if (isError) {
            toast.error("Falha ao carregar eventos. Verifique sua conexão.");
        }
    }, [isError]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        const filtered = events.filter(
            (event) =>
                event.name.toLowerCase().includes(lowerSearch) ||
                event.description.toLowerCase().includes(lowerSearch) ||
                event.location.toLowerCase().includes(lowerSearch)
        );
        setFilteredEvents(filtered);
    }, [search, events]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
                    <p className="text-muted-foreground">
                        Descubra e inscreva-se nos próximos eventos.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-72">
                        <Input
                            placeholder="Buscar eventos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {session?.user?.role === "ADMIN" && (
                        <Button asChild>
                            <Link href="/admin/events/create">Criar Evento</Link>
                        </Button>
                    )}
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Nenhum evento encontrado.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                                    {event.active ? <Badge variant="default">Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {event.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {format(new Date(event.eventDate), "PPP p", { locale: ptBR })}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {event.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    Vagas: {event.maxCapacity}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => router.push(`/events/${event.id}`)}
                                >
                                    Ver Detalhes
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <OfflinePreloader events={filteredEvents} />
        </div>
    );
}
