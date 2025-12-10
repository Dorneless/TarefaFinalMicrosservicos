import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Event, EventRegistration } from "@/types";

interface CacheDB extends DBSchema {
    events: {
        key: string;
        value: {
            key: string; // 'all' or event id
            data: Event[] | Event;
            timestamp: number;
        };
    };
    registrations: {
        key: string;
        value: {
            key: string; // 'user' or registration id
            data: EventRegistration[] | EventRegistration;
            timestamp: number;
        };
    };
}

let cacheDbInstance: IDBPDatabase<CacheDB> | null = null;

export async function initCacheDB(): Promise<IDBPDatabase<CacheDB>> {
    if (cacheDbInstance) {
        return cacheDbInstance;
    }

    cacheDbInstance = await openDB<CacheDB>("events-cache", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("events")) {
                db.createObjectStore("events", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("registrations")) {
                db.createObjectStore("registrations", { keyPath: "key" });
            }
        },
    });

    return cacheDbInstance;
}

// Event Cache
export async function cacheEvents(events: Event[]): Promise<void> {
    const db = await initCacheDB();
    await db.put("events", {
        key: "all",
        data: events,
        timestamp: Date.now(),
    });
    // Also cache individual events
    for (const event of events) {
        await cacheEvent(event);
    }
}

export async function getCachedEvents(): Promise<Event[] | null> {
    const db = await initCacheDB();
    const cached = await db.get("events", "all");
    if (!cached) return null;

    // Cache valid for 24 hours (expanded for better offline exp)
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge > 24 * 60 * 60 * 1000) {
        return null;
    }

    return Array.isArray(cached.data) ? cached.data : [cached.data];
}

export async function cacheEvent(event: Event): Promise<void> {
    const db = await initCacheDB();
    await db.put("events", {
        key: event.id,
        data: event,
        timestamp: Date.now(),
    });
}

export async function getCachedEvent(id: string): Promise<Event | null> {
    const db = await initCacheDB();
    const cached = await db.get("events", id);
    if (!cached) return null;

    // Cache valid for 24 hours
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge > 24 * 60 * 60 * 1000) {
        return null;
    }

    return Array.isArray(cached.data) ? cached.data[0] : cached.data;
}

// Registration Cache
export async function cacheRegistrations(registrations: EventRegistration[]): Promise<void> {
    const db = await initCacheDB();
    await db.put("registrations", {
        key: "user",
        data: registrations,
        timestamp: Date.now(),
    });
}

export async function getCachedRegistrations(): Promise<EventRegistration[] | null> {
    const db = await initCacheDB();
    const cached = await db.get("registrations", "user");
    if (!cached) return null;

    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge > 24 * 60 * 60 * 1000) {
        return null;
    }

    return Array.isArray(cached.data) ? cached.data : [cached.data];
}
