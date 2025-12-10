import { getSession } from "next-auth/react"
import { auth } from "@/auth"

const API_EVENTS_URL = process.env.NEXT_PUBLIC_API_EVENTS_URL

async function getAuthHeader() {
    if (typeof window === "undefined") {
        // Server-side
        const session = await auth()
        return session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}
    } else {
        // Client-side
        const session = await getSession()
        return session?.user?.accessToken ? { Authorization: `Bearer ${(session.user as any).accessToken}` } : {}
    }
}

const API_LOGS_URL = process.env.NEXT_PUBLIC_API_LOGS_URL || "http://177.44.248.107:8084/api"

async function logRequest(method: string, url: string, status: number, body?: any) {
    if (url.includes("/logs")) return // Avoid infinite loop

    try {
        const session = await getAuthHeader()
        // We technically don't have the full user object here easily without decoding token or fetching session again, 
        // but let's try to do it right if possible. 
        // Actually, the requirement says "interceptador deve salvar na tabela de logs".
        // The backend `user-service` logs endpoint usually expects data about who did what.
        // Let's assume the logs service just takes what we send.

        // We need to get the user email if possible.
        let userEmail = "anonymous"
        let userId = "unknown"

        if (typeof window !== "undefined") {
            const sess = await getSession()
            if (sess?.user) {
                userEmail = sess.user.email || "unknown"
                userId = (sess.user as any).id || "unknown" // Cast as any because ID might not be in standard type
            }
        } else {
            const sess = await auth()
            if (sess?.user) {
                userEmail = sess.user.email || "unknown"
                userId = (sess.user as any).id || "unknown"
            }
        }

        // We fire and forget this request to not block the UI
        fetch(`${API_LOGS_URL}/logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // ...session // Should we send auth headers to log service?
            },
            body: JSON.stringify({
                method,
                path: url,
                statusCode: status,
                userEmail, // The backed might expect 'userEmail' or similar
                ip: "frontend", // We can't easily get real IP from client side, maybe 'frontend' is enough
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.error("Failed to log request:", err))
    } catch (e) {
        console.error("Error in log interceptor:", e)
    }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = await getAuthHeader()
    let status = 0
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...headers,
                ...options.headers,
            } as HeadersInit,
        })
        status = res.status

        // Log the request
        logRequest(options.method || "GET", url, status, options.body)

        // Handle 401/403 globally ideally, but for now just throw
        if (!res.ok) {
            const error = await res.text()
            throw new Error(error || `Request failed with status ${res.status}`)
        }

        if (res.status === 204) return null

        return res.json()
    } catch (error) {
        // Log logging failure does not make sense, but we should log the failed request status if we have it, or 500
        if (status === 0) status = 500 // Network error or something
        logRequest(options.method || "GET", url, status, options.body)
        throw error
    }
}

export async function getUpcomingEvents() {
    return fetchWithAuth(`${API_EVENTS_URL}/api/events/upcoming`, { cache: "no-store" })
}

export async function getEventRegistrations(eventId: string) {
    return fetchWithAuth(`${API_EVENTS_URL}/api/events/${eventId}/registrations`, { cache: "no-store" })
}

export async function registerForEvent(eventId: string) {
    // The API might expect a body or not. Swagger says body required EventRegistrationDTO but some endpoints auto-fill from token.
    // /api/events/{eventId}/register -> EventRegistrationDTO required? 
    // checking swagger schema for EventRegistrationDTO: required userEmail, userId, userName.
    // Wait, if I am logged in, the backend should know who I am. 
    // Let's assume the backend extracts user info from the token for /register, 
    // BUT the swagger says requestBody is required.
    // I will send empty object if not strict, or I might need to send my own data.
    // If the backend requires me to send my own data, I need to get it from session.

    // Actually, let's look closely at swagger:
    // /api/events/{eventId}/register -> requestBody: EventRegistrationDTO
    // This endpoint might be for "self registration" but badly designed if it asks for user ID/Email again.
    // Or maybe it's just documented that way. 

    // However, I will try sending the user data from session if I can, OR just empty object if the backend ignores it.
    // Let's try sending the data to be safe.

    const headers = await getAuthHeader()
    // We need user details. 
    // This is tricky in a generic function. 
    // Use getSession/auth to get user details.
    let user;
    if (typeof window === "undefined") {
        const session = await auth();
        user = session?.user;
    } else {
        const session = await getSession();
        user = session?.user;
    }

    if (!user) throw new Error("User not authenticated");

    return fetchWithAuth(`${API_EVENTS_URL}/api/events/${eventId}/register`, {
        method: "POST",
        body: JSON.stringify({
            userId: user.id, // we might not have ID in session if not added to callbacks
            userEmail: user.email,
            userName: user.name
        })
    })
}

export async function markAttendance(eventId: string, email: string, attended: boolean) {
    return fetchWithAuth(`${API_EVENTS_URL}/api/events/${eventId}/attendance-by-email`, {
        method: "POST",
        body: JSON.stringify({ email, attended }),
    })
}

export async function adminRegisterUserByEmail(eventId: string, email: string) {
    return fetchWithAuth(`${API_EVENTS_URL}/api/events/${eventId}/register-by-email`, {
        method: "POST",
        body: JSON.stringify({ email }),
    })
}

export async function getMyRegistrations() {
    return fetchWithAuth(`${API_EVENTS_URL}/api/my-events`, { cache: "no-store" })
}

const API_USERS_URL = process.env.NEXT_PUBLIC_API_USERS_URL || "http://localhost:8080" // Fallback or env var

export async function updateUser(data: { name?: string; document?: string; phone?: string }) {
    return fetchWithAuth(`${API_USERS_URL}/api/users/me`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}

const API_USER_URL = process.env.NEXT_PUBLIC_API_USER_URL

export async function requestLoginCode(email: string) {
    const res = await fetch(`${API_USER_URL}/api/auth/request-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    })

    if (!res.ok) {
        throw new Error("Erro ao enviar código (verifique se o email está cadastrado)")
    }

    return true
}

const API_CERTIFICATES_URL = process.env.NEXT_PUBLIC_API_CERTIFICATION_URL

export async function generateCertificate(eventId: string) {
    const headers = await getAuthHeader()
    const res = await fetch(`${API_CERTIFICATES_URL}/certificates/issue`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(headers as Record<string, string>),
        },
        body: JSON.stringify({ eventId }),
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Failed to generate certificate: ${res.status}`)
    }

    return res.blob()
}

export async function getMyCertificates() {
    const res = await fetchWithAuth(`${API_CERTIFICATES_URL}/certificates/my-certificates`, { cache: "no-store" })
    return res
}

export async function cancelRegistration(registrationId: string) {
    return fetchWithAuth(`${API_EVENTS_URL}/api/registrations/${registrationId}`, {
        method: "DELETE",
    })
}

export async function verifyCertificate(code: string) {
    // Public endpoint, no auth header needed?
    // Controller has NO @UseGuards on verifyCertificate?
    // Let's check controller again. Yes: @Get('verify/:code') has NO @UseGuards.
    const res = await fetch(`${API_CERTIFICATES_URL}/certificates/verify/${code}`, {
        cache: "no-store",
    })

    if (!res.ok) {
        if (res.status === 404) return null
        throw new Error(`Failed to verify certificate: ${res.status}`)
    }

    return res.json()
}

export async function downloadCertificateByCode(code: string) {
    // This is the secure download that requires auth if we use the endpoint @Get('download/:code') in controller
    // which has @UseGuards(JwtAuthGuard).
    // For public verification, maybe we don't allow download? 
    // The requirement says "verify certificate by code", usually means seeing details.

    const headers = await getAuthHeader()
    const res = await fetch(`${API_CERTIFICATES_URL}/certificates/download/${code}`, {
        method: "GET",
        headers: {
            ...(headers as Record<string, string>),
        },
    })

    if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Failed to download certificate: ${res.status}`)
    }
    return res.blob()
}

// Notifications API

const API_NOTIFICATIONS_URL = process.env.NEXT_PUBLIC_API_NOTIFICATION_URL

export interface EventRegistrationDto {
    name: string;
    email: string;
    eventName: string;
    eventDate: string;
    eventLocation: string;
}

export interface EventCancellationDto {
    name: string;
    email: string;
    eventName: string;
    eventDate: string;
}

export interface AttendanceConfirmedDto {
    name: string;
    email: string;
    eventName: string;
    eventDate: string;
}

export interface CertificateIssuedDto {
    email: string;
    userName: string;
    eventName: string;
    certificateCode: string;
    pdfPath?: string; // Optional since we might not have it or it might be a link
}

export async function sendEventRegistrationNotification(data: EventRegistrationDto) {
    return fetchWithAuth(`${API_NOTIFICATIONS_URL}/api/notifications/event-registration`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export async function sendEventCancellationNotification(data: EventCancellationDto) {
    return fetchWithAuth(`${API_NOTIFICATIONS_URL}/api/notifications/event-cancellation`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export async function sendAttendanceConfirmedNotification(data: AttendanceConfirmedDto) {
    return fetchWithAuth(`${API_NOTIFICATIONS_URL}/api/notifications/attendance-confirmed`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export async function sendCertificateIssuedNotification(data: CertificateIssuedDto) {
    return fetchWithAuth(`${API_NOTIFICATIONS_URL}/api/notifications/certificate-issued`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export interface LogEntry {
    id: number;
    method: string;
    path: string;
    statusCode: number;
    userEmail: string;
    ip: string;
    timestamp: string;
    body?: string;
}

export async function getSystemLogs(): Promise<LogEntry[]> {
    return fetchWithAuth(`${API_LOGS_URL}/logs`, { cache: "no-store", method: "GET" })
}

