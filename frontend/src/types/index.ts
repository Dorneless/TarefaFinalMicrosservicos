export interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    active: boolean;
    accessToken?: string;
    phone?: string;
    document?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    expiration: string;
}

export interface Event {
    id: string;
    name: string;
    description: string;
    eventDate: string;
    location: string;
    maxCapacity: number;
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
    userId: string;
    userEmail: string;
    userName: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    issuedAt: string;
    pdfPath: string;
    active: boolean;
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
