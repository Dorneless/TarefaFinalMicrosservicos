"use client";

import { useEffect, useState } from "react";
import { eventsService } from "@/lib/api";
import { Event } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        const filtered = events.filter(
            (event) =>
                event.title.toLowerCase().includes(lowerSearch) ||
                event.description.toLowerCase().includes(lowerSearch) ||
                event.location.toLowerCase().includes(lowerSearch)
        );
        setFilteredEvents(filtered);
    }, [search, events]);

    const fetchEvents = async () => {
        try {
            const response = await eventsService.get<Event[]>("/events");
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            toast.error("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">
                        Discover and register for upcoming events.
                    </p>
                </div>
                <div className="w-full md:w-72">
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No events found.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                    {event.active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {event.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {format(new Date(event.date), "PPP p")}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {event.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4" />
                                    Max Participants: {event.maxParticipants}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/events/${event.id}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
