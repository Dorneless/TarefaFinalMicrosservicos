"use client"

import { useState, useEffect } from "react"

import { getUpcomingEvents, getMyRegistrations } from "@/lib/api"
import { EventResponseDTO } from "@/types/events"
import { EventRegistrationResponseDTO } from "@/types/registrations"
import { EventCard } from "@/components/events/event-card"
import { EventDetailsModal } from "@/components/events/event-details-modal"
import { AttendanceModal } from "@/components/events/attendance-modal"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function EventsPage() {
    const { data: session, status } = useSession()
    const [events, setEvents] = useState<EventResponseDTO[]>([])
    const [registrations, setRegistrations] = useState<EventRegistrationResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<EventResponseDTO | null>(null)

    // Modals state
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)

    useEffect(() => {
        // Always fetch events on mount
        fetchEvents()
    }, [])

    useEffect(() => {
        // Fetch registrations only when authenticated
        if (status === 'authenticated') {
            fetchRegistrations()
        }
    }, [status])

    async function fetchEvents() {
        setLoading(true) // Set loading true when starting to fetch events
        try {
            const data = await getUpcomingEvents()
            setEvents(data)
        } catch (error) {
            console.error("Failed to fetch events", error)
        } finally {
            setLoading(false) // Set loading false after events are fetched
        }
    }

    async function fetchRegistrations() {
        try {
            const data = await getMyRegistrations()
            setRegistrations(data)
        } catch (error) {
            console.error("Failed to fetch registrations", error)
        }
    }

    function handleEventClick(event: EventResponseDTO) {
        setSelectedEvent(event)
        setIsDetailsOpen(true)
    }

    function handleOpenAttendance() {
        setIsDetailsOpen(false) // Close details
        setIsAttendanceOpen(true) // Open attendance
    }

    function getRegistrationStatus(eventId: string): 'none' | 'registered' | 'confirmed' {
        const registration = registrations.find(r => r.eventId === eventId)
        if (!registration) return 'none'
        return registration.attended ? 'confirmed' : 'registered'
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Próximos Eventos</h1>
                            <p className="text-gray-500 mt-2 text-lg">Descubra e participe de eventos incríveis.</p>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onDetailsClick={handleEventClick}
                                registrationStatus={getRegistrationStatus(event.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">Nenhum evento futuro encontrado.</p>
                    </div>
                )}

                {/* Modals */}
                <EventDetailsModal
                    event={selectedEvent}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    onOpenAttendance={handleOpenAttendance}
                    registration={registrations.find(r => r.eventId === selectedEvent?.id) || null}
                />

                <AttendanceModal
                    event={selectedEvent}
                    isOpen={isAttendanceOpen}
                    onClose={() => setIsAttendanceOpen(false)}
                />

            </div>
        </div>
    )
}
