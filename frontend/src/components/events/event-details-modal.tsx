"use client"

import { useState } from "react"
// Assuming user has shadcn/ui or similar. If not, I will use a simple fixed modal implementation to avoid dependency issues.
// Given strict instructions not to use placeholders, I will build a custom modal if shadcn is not present.
// I haven't checked for shadcn components folder.
// Let's implement a custom Modal component inline or file to be safe and "wow" the user with custom design.
// Actually, I'll create a reusable Modal in this file for simplicity or use a portal if I can.
// But wait, the prompt says "Use Next.js", "Vanilla CSS" (implied Tailwind).
// I will creating a custom Modal to be safe.

import { EventRegistrationResponseDTO } from "@/types/registrations"
import { EventResponseDTO } from "@/types/events"
import { Calendar, MapPin, Users, Info, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { registerForEvent, cancelRegistration, sendEventRegistrationNotification, sendEventCancellationNotification } from "@/lib/api"

interface EventDetailsModalProps {
    event: EventResponseDTO | null
    isOpen: boolean
    onClose: () => void
    onUnregister?: () => void // Optional for future
    onOpenAttendance?: () => void
    registration: EventRegistrationResponseDTO | null
}

export function EventDetailsModal({ event, isOpen, onClose, onOpenAttendance, registration }: EventDetailsModalProps) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    if (!isOpen || !event) return null

    const isAdmin = session?.user?.role === "ADMIN"
    const date = new Date(event.eventDate).toLocaleDateString("pt-BR", {
        weekday: 'long',
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    async function handleRegister() {
        setLoading(true)
        setMessage(null)
        try {
            await registerForEvent(event!.id)

            // Send notification
            if (session?.user?.email && session?.user?.name) {
                try {
                    await sendEventRegistrationNotification({
                        name: session.user.name,
                        email: session.user.email,
                        eventName: event!.name,
                        eventDate: new Date(event!.eventDate).toLocaleDateString("pt-BR"),
                        eventLocation: event!.location || "Online"
                    })
                } catch (error) {
                    console.error("Failed to send notification", error)
                }
            }

            setMessage({ type: 'success', text: 'Inscrição realizada com sucesso!' })
            // Maybe refresh data?
            window.location.reload() // Simple reload to refresh state for now
        } catch (error: any) {
            // Checking if error message contains information about already registered
            if (error.message && error.message.includes("409")) {
                setMessage({ type: 'error', text: 'Você já está inscrito neste evento.' })
            } else {
                setMessage({ type: 'error', text: 'Erro ao realizar inscrição. Tente novamente.' })
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel() {
        if (!registration || !confirm("Tem certeza que deseja cancelar sua inscrição?")) return

        setLoading(true)
        setMessage(null)
        try {
            await cancelRegistration(registration.id)

            // Send notification
            if (session?.user?.email && session?.user?.name) {
                try {
                    await sendEventCancellationNotification({
                        name: session.user.name,
                        email: session.user.email,
                        eventName: event!.name,
                        eventDate: new Date(event!.eventDate).toLocaleDateString("pt-BR"),
                    })
                } catch (error) {
                    console.error("Failed to send notification", error)
                }
            }

            setMessage({ type: 'success', text: 'Inscrição cancelada com sucesso!' })
            window.location.reload() // Refresh to update state
        } catch (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Erro ao cancelar inscrição.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
                    <h2 className="text-3xl font-bold text-white px-8 text-center">{event.name}</h2>

                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>

                <div className="p-8">
                    <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700">
                            <Calendar className="h-4 w-4" />
                            <span className="capitalize">{date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full text-purple-700">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location || "Online"}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700">
                            <Users className="h-4 w-4" />
                            <span>{event.registeredCount} / {event.maxCapacity || "∞"} inscritos</span>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-600 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Sobre o evento
                        </h3>
                        <p>{event.description || "Nenhuma descrição fornecida para este evento."}</p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Fechar
                        </button>

                        {isAdmin ? (
                            <button
                                onClick={onOpenAttendance}
                                className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
                            >
                                Gerenciar Presenças
                            </button>
                        ) : registration ? (
                            registration.attended ? (
                                <div className="px-5 py-2.5 rounded-lg bg-green-100 text-green-700 font-medium">
                                    Presença Confirmada
                                </div>
                            ) : (
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-lg text-red-600 border border-red-200 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    {loading ? "Cancelando..." : "Cancelar Inscrição"}
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleRegister}
                                disabled={loading || (event.maxCapacity ? event.registeredCount >= event.maxCapacity : false)}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                            >
                                {loading ? "Inscrevendo..." : (event.maxCapacity && event.registeredCount >= event.maxCapacity ? "Esgotado" : "Inscrever-se")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
