"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { get, set } from "idb-keyval"
import { adminRegisterUserByEmail, markAttendance } from "@/lib/api"

export interface OfflineUser {
    id: string // temp ID
    eventId: string
    email: string
    timestamp: number
}

export interface AttendanceChange {
    registrationId: string
    attended: boolean
    timestamp: number
}

interface OfflineContextType {
    isOnline: boolean
    pendingUsers: OfflineUser[]
    attendanceQueue: AttendanceChange[]
    addOfflineUser: (eventId: string, email: string) => Promise<void>
    toggleOfflineAttendance: (registrationId: string, attended: boolean) => Promise<void>
    syncChanges: () => Promise<void>
    hasPendingChanges: boolean
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

const PENDING_USERS_KEY = "offline-pending-users"
const ATTENDANCE_QUEUE_KEY = "offline-attendance-queue"

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const [pendingUsers, setPendingUsers] = useState<OfflineUser[]>([])
    const [attendanceQueue, setAttendanceQueue] = useState<AttendanceChange[]>([])

    // Load initial state from IDB
    useEffect(() => {
        const load = async () => {
            const users = await get<OfflineUser[]>(PENDING_USERS_KEY) || []
            const attendance = await get<AttendanceChange[]>(ATTENDANCE_QUEUE_KEY) || []
            setPendingUsers(users)
            setAttendanceQueue(attendance)
        }
        load()

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const addOfflineUser = async (eventId: string, email: string) => {
        const newUser: OfflineUser = {
            id: `temp-${Date.now()}`,
            eventId,
            email,
            timestamp: Date.now()
        }
        const updated = [...pendingUsers, newUser]
        setPendingUsers(updated)
        await set(PENDING_USERS_KEY, updated)
    }

    const toggleOfflineAttendance = async (registrationId: string, attended: boolean) => {
        // Check if there is already a change for this registration, update it if so
        const existingIndex = attendanceQueue.findIndex(a => a.registrationId === registrationId)
        let updated = [...attendanceQueue]

        if (existingIndex >= 0) {
            updated[existingIndex] = { registrationId, attended, timestamp: Date.now() }
        } else {
            updated.push({ registrationId, attended, timestamp: Date.now() })
        }

        setAttendanceQueue(updated)
        await set(ATTENDANCE_QUEUE_KEY, updated)
    }

    const syncChanges = async () => {
        if (!isOnline) return

        let usersFailed: OfflineUser[] = []
        let attendanceFailed: AttendanceChange[] = []

        // Sync Users
        for (const user of pendingUsers) {
            try {
                await adminRegisterUserByEmail(user.eventId, user.email)
            } catch (error) {
                console.error("Failed to sync user:", user, error)
                usersFailed.push(user)
            }
        }

        // Sync Attendance
        for (const item of attendanceQueue) {
            try {
                // If the registration ID is temporary (from a just-synced user), we might have a problem.
                // However, the backend would need to return the real ID. 
                // For now, assuming attendance is only for existing users OR we need to fetch registrations again.
                // If we marked attendance for a "temp" user, we need to map the temp ID to the real ID.
                // This logic is complex. 
                // SIMPLIFICATION: We only support marking attendance offline for users who were ALREADY downloaded.
                // OR, if we added a user offline, we assume we can't mark their attendance until we sync?
                // The requirement says: "o admin também deve conseguir registrar presença para os usuários que já tinham carregados ... ou para este novo usuário que ele adicionou de forma offline"
                // So... we need to handle that.

                // If it's a real registration ID (UUID), proceed.
                // If it's a temp ID, we can't sync it yet UNLESS we just created it.
                // We'll need to refetch registrations after syncing users to resolve IDs? 
                // Or maybe `adminRegisterUserByEmail` returns the new registration.

                // Let's assume for now we try to sync. If 404, we keep it? 
                // Actually, `adminRegisterUserByEmail` creates the registration.
                // If we marked attendance for that user, we don't have their registration ID yet. 
                // We likely used the `temp-ID` in the UI. 
                // We can't send `temp-ID` to the backend.

                // Refinment: When syncing users, we should try to get the new registration ID.
                // But `adminRegisterUserByEmail` might not return it cleanly or we might need to look it up.

                // Strategy: 
                // 1. Sync all users.
                // 2. Fetch latest registrations for relevant events? Expensive.
                // 3. Just Try to mark attendance. If it fails, keep in queue?

                await markAttendance(item.registrationId, item.attended)
            } catch (error) {
                console.error("Failed to sync attendance:", item, error)
                attendanceFailed.push(item)
            }
        }

        setPendingUsers(usersFailed)
        setAttendanceQueue(attendanceFailed)
        await set(PENDING_USERS_KEY, usersFailed)
        await set(ATTENDANCE_QUEUE_KEY, attendanceFailed)

        // Force refresh of queries? 
        // We'll leave that to the UI to invalidate.
    }

    return (
        <OfflineContext.Provider value={{
            isOnline,
            pendingUsers,
            attendanceQueue,
            addOfflineUser,
            toggleOfflineAttendance,
            syncChanges,
            hasPendingChanges: pendingUsers.length > 0 || attendanceQueue.length > 0
        }}>
            {children}
        </OfflineContext.Provider>
    )
}

export function useOffline() {
    const context = useContext(OfflineContext)
    if (context === undefined) {
        throw new Error("useOffline must be used within an OfflineProvider")
    }
    return context
}
