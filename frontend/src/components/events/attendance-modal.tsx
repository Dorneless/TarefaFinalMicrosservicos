"use client"

import { useState } from "react"
import { EventResponseDTO, EventRegistrationResponseDTO } from "@/types/events"
import { getEventRegistrations, markAttendance, adminRegisterUserByEmail, sendEventRegistrationNotification, sendAttendanceConfirmedNotification } from "@/lib/api"
import { X, Search, Check, X as XIcon, UserPlus, Loader2, RefreshCw, CloudOff, CloudUpload } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useOffline } from "@/context/offline-context"

interface AttendanceModalProps {
    event: EventResponseDTO | null
    isOpen: boolean
    onClose: () => void
}

export function AttendanceModal({ event, isOpen, onClose }: AttendanceModalProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [newUserEmail, setNewUserEmail] = useState("")
    const [registeringUser, setRegisteringUser] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [syncing, setSyncing] = useState(false)

    const queryClient = useQueryClient()
    const { isOnline, addOfflineUser, toggleOfflineAttendance, pendingUsers, attendanceQueue, syncChanges, hasPendingChanges } = useOffline()

    const { data: serverRegistrations = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ["registrations", event?.id],
        queryFn: () => event ? getEventRegistrations(event.id) : Promise.resolve([]),
        enabled: !!event && isOpen,
        staleTime: 1000 * 60 * 5 // 5 min
    })

    // Merge server registrations with offline pending users
    const allRegistrations = [...serverRegistrations]

    if (event) {
        // Add pending users for this event
        const offlineUsersForEvent = pendingUsers.filter(u => u.eventId === event.id)
        offlineUsersForEvent.forEach(u => {
            // Check if already in list (maybe synced but cache not invalid?)
            if (!allRegistrations.find(r => r.userEmail === u.email)) {
                allRegistrations.push({
                    id: u.id,
                    eventId: u.eventId,
                    userId: "temp",
                    userEmail: u.email,
                    userName: u.email.split("@")[0] + " (Offline)",
                    attended: false,
                    registrationDate: new Date(u.timestamp).toISOString()
                })
            }
        })
    }

    // Apply attendance queue overrides
    const processedRegistrations = allRegistrations.map(reg => {
        const pendingChange = attendanceQueue.find(q => q.eventId === event?.id && q.email === reg.userEmail)
        if (pendingChange) {
            return { ...reg, attended: pendingChange.attended }
        }
        return reg
    })

    async function handleAttendance(registration: EventRegistrationResponseDTO, attended: boolean) {
        if (!event) return

        if (!isOnline) {
            await toggleOfflineAttendance(event.id, registration.userEmail, attended)
            return
        }

        try {
            await markAttendance(event.id, registration.userEmail, attended)

            // Send notification if confirmed present
            if (attended) {
                try {
                    await sendAttendanceConfirmedNotification({
                        name: registration.userName,
                        email: registration.userEmail,
                        eventName: event.name,
                        eventDate: new Date(event.eventDate).toLocaleDateString("pt-BR"),
                    })
                } catch (error) {
                    console.error("Failed to send notification", error)
                }
            }

            // Invalidate to get fresh state
            queryClient.invalidateQueries({ queryKey: ["registrations", event.id] })
        } catch (err) {
            console.error(err)
            // Fallback to offline queue?
            if (confirm("Falha ao inidicar presença. Deseja salvar ação para sincronizar depois?")) {
                await toggleOfflineAttendance(event.id, registration.userEmail, attended)
            }
        }
    }

    async function handleRegisterUser(e: React.FormEvent) {
        e.preventDefault()
        if (!event || !newUserEmail) return

        setRegisteringUser(true)
        setError(null)

        try {
            if (!isOnline) {
                await addOfflineUser(event.id, newUserEmail)
                setNewUserEmail("")
                // No need to refetch, local state updates immediately via context
            } else {
                const response = await adminRegisterUserByEmail(event.id, newUserEmail)

                // Send notification
                try {
                    // Response typically contains the created registration which should have user details
                    // If response has name, use it. If not, try to use email part or default.
                    // The API types aren't strictly typed here for response, assuming 'any' or check backend.
                    // Let's assume response (RegistrationDTO) has userName and userEmail.
                    const userName = response?.userName || newUserEmail.split("@")[0]

                    await sendEventRegistrationNotification({
                        name: userName,
                        email: newUserEmail,
                        eventName: event.name,
                        eventDate: new Date(event.eventDate).toLocaleDateString("pt-BR"),
                        eventLocation: event.location || "Online"
                    })
                } catch (error) {
                    console.error("Failed to send notification", error)
                }

                setNewUserEmail("")
                queryClient.invalidateQueries({ queryKey: ["registrations", event.id] })
            }
        } catch (err) {
            console.error(err)
            // If request fails, maybe we are offline effectively?
            // Ask user if they want to save offline
            if (confirm("Falha na requisição. Deseja salvar este usuário offline para sincronizar depois?")) {
                await addOfflineUser(event.id, newUserEmail)
                setNewUserEmail("")
                setError(null)
            } else {
                setError("Erro ao cadastrar usuário.")
            }
        } finally {
            setRegisteringUser(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        try {
            await syncChanges()
            if (event) {
                queryClient.invalidateQueries({ queryKey: ["registrations", event.id] })
            }
        } catch (e) {
            console.error(e)
            alert("Erro ao sincronizar.")
        } finally {
            setSyncing(false)
        }
    }

    if (!isOpen || !event) return null

    const filteredRegistrations = processedRegistrations.filter(reg =>
        reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.userName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Presenças</h2>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-500">{event.name}</span>
                            {!isOnline && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                    <CloudOff className="w-3 h-3" /> Offline
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {hasPendingChanges && (
                    <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100 flex items-center justify-between">
                        <p className="text-yellow-700 text-sm">
                            Existem alterações pendentes de sincronização.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing || !isOnline}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <CloudUpload className={`h-4 w-4 ${syncing ? 'animate-bounce' : ''}`} />
                            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
                        </button>
                    </div>
                )}

                <div className="p-6 flex-grow overflow-auto">
                    {/* Add User Form */}
                    <form onSubmit={handleRegisterUser} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Cadastrar Novo Usuário
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="Email do usuário"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 placeholder:text-gray-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={registeringUser}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                            >
                                {registeringUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </form>

                    {/* List */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                        <button onClick={() => refetch()} className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors cursor-pointer" disabled={!isOnline}>
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Nome</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3 text-center">Presença</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">Carregando...</td></tr>
                                ) : filteredRegistrations.length === 0 ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhuma inscrição encontrada.</td></tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{reg.userName}</td>
                                            <td className="px-4 py-3 text-gray-500">{reg.userEmail}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleAttendance(reg, !reg.attended)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${reg.attended
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {reg.attended ? (
                                                        <><Check className="h-3 w-3" /> Presente</>
                                                    ) : (
                                                        <><XIcon className="h-3 w-3" /> Ausente</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div >
    )
}
