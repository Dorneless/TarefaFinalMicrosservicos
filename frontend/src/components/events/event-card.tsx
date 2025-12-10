"use client"

import { EventResponseDTO } from "@/types/events"
import { Calendar, MapPin, Users } from "lucide-react"

interface EventCardProps {
    event: EventResponseDTO
    onDetailsClick: (event: EventResponseDTO) => void
    registrationStatus?: 'none' | 'registered' | 'confirmed'
}

export function EventCard({ event, onDetailsClick, registrationStatus = 'none' }: EventCardProps) {
    const date = new Date(event.eventDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
            <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{event.description || "Sem descrição"}</p>

                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="line-clamp-1">{event.location || "Online"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{event.registeredCount} / {event.maxCapacity || "∞"} inscritos</span>
                    </div>
                </div>

                {/* Registration Status Indicator */}
                {registrationStatus && registrationStatus !== 'none' && (
                    <div className={`mt-4 flex items-center gap-2 text-sm font-medium p-2 rounded-md ${registrationStatus === 'confirmed'
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                        {registrationStatus === 'confirmed' ? (
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                Presença Confirmada
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Inscrito
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                    onClick={() => onDetailsClick(event)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm cursor-pointer"
                >
                    Ver Detalhes
                </button>
            </div>
        </div>
    )
}
