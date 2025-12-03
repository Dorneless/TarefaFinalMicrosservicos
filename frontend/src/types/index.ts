export interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    active: boolean;
    accessToken?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    expiration: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxParticipants: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventRegistration {
    id: string;
    eventId: string;
    eventName?: string; // Added
    userId: string;
    userEmail: string;
    userName?: string; // Added
    registrationDate?: string; // Deprecated in favor of registeredAt?
    registeredAt?: string; // Added to match DTO
    attended: boolean;
    status: 'CONFIRMED' | 'CANCELLED';
}

export interface Certificate {
    id: string;
    code: string;
    userEmail: string;
    eventId: string;
    issueDate: string;
    pdfUrl: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
}
