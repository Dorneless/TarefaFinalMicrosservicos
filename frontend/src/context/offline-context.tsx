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
    eventId: string
    email: string
    attended: boolean
    timestamp: number
}

interface OfflineContextType {
    isOnline: boolean
    pendingUsers: OfflineUser[]
    attendanceQueue: AttendanceChange[]
    addOfflineUser: (eventId: string, email: string) => Promise<void>
    toggleOfflineAttendance: (eventId: string, email: string, attended: boolean) => Promise<void>
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

    const toggleOfflineAttendance = async (eventId: string, email: string, attended: boolean) => {
        // Check if there is already a change for this registration, update it if so
        const existingIndex = attendanceQueue.findIndex(a => a.eventId === eventId && a.email === email)
        let updated = [...attendanceQueue]

        if (existingIndex >= 0) {
            updated[existingIndex] = { eventId, email, attended, timestamp: Date.now() }
        } else {
            updated.push({ eventId, email, attended, timestamp: Date.now() })
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
                await markAttendance(item.eventId, item.email, item.attended)
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
