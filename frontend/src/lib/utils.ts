import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
        return dateString;
    }
}

export function formatDateTime(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
        return dateString;
    }
}

export function formatShortDate(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
        return dateString;
    }
}

export function generateId(): string {
    return crypto.randomUUID();
}
