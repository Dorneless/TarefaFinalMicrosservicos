
export interface EventRegistrationResponseDTO {
    id: string
    eventId: string
    eventName: string
    userId: string
    userEmail: string
    userName: string
    registeredAt: string
    attended: boolean
    attendedAt: string | null
    registeredBy: string
}
