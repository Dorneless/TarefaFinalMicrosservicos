// Types for User
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

// Types for Auth
export interface AuthResponse {
    token: string;
    type: string;
    expiration: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

// Types for Events
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
    eventName?: string;
    userId: string;
    userEmail: string;
    userName?: string;
    registeredAt?: string;
    attended: boolean;
    status: 'CONFIRMED' | 'CANCELLED';
}

// Types for Certificates
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

// Types for Logs
export interface Log {
    id: string;
    userEmail?: string;
    timestamp: string;
    body?: string;
    statusCode?: number;
    method: string;
    service: string;
    ip?: string;
    path?: string;
}

// Types for Offline Sync
export type PendingActionType =
    | 'REGISTER_USER_TO_EVENT'
    | 'MARK_ATTENDANCE'
    | 'CREATE_USER'
    | 'CREATE_EVENT'
    | 'ISSUE_CERTIFICATE';

export interface PendingAction {
    id: string;
    type: PendingActionType;
    payload: Record<string, unknown>;
    createdAt: string;
    status: 'pending' | 'syncing' | 'failed';
    description: string;
    eventId?: string;
    registrationId?: string;
    errorMessage?: string;
}

// NextAuth extended types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            accessToken: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        role: string;
        accessToken: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken: string;
        role: string;
        id: string;
    }
}
