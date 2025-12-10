export interface EventResponseDTO {
    id: string
    name: string
    description?: string
    eventDate: string
    location?: string
    maxCapacity?: number
    registeredCount: number
    attendedCount: number
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface EventDTO {
    name: string
    description?: string
    eventDate: string
    location?: string
    maxCapacity?: number
}

export interface EventRegistrationResponseDTO {
    id: string
    eventId: string
    eventName: string
    userId: string
    userEmail: string
    userName: string
    registeredAt: string
    attended: boolean
    attendedAt?: string
    registeredBy?: string
}

export interface AttendanceDTO {
    attended: boolean
}

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    accessToken: string;
}
