"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Event } from "@/types";

interface OfflinePreloaderProps {
    events: Event[];
}

export function OfflinePreloader({ events }: OfflinePreloaderProps) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (!events || events.length === 0) return;

        // Filter for active events or recent ones to avoid preloading too much
        // For now, preload all displayed events (pagination usually limits this)
        const eventsToPreload = events;

        const preload = async () => {
            // Use requestIdleCallback if available, or setTimeout to avoid blocking main thread
            const runPreload = async () => {
                for (const event of eventsToPreload) {
                    try {
                        // 1. Preload Event Details Page
                        // We use fetch with 'no-cors' mode if possible, but Next.js middleware might require standard
                        // However, we want to populate the Cache Storage that 'NetworkFirst' strategy uses.
                        // The service worker intercepts active fetches.
                        await fetch(`/events/${event.id}`, { priority: 'low' } as any);

                        // 2. If Admin, Preload Attendance Page
                        if (isAdmin) {
                            await fetch(`/admin/events/${event.id}/attendance`, { priority: 'low' } as any);
                        }
                    } catch (e) {
                        // Ignore errors, preloading is best-effort
                        console.debug(`Failed to preload offline page for event ${event.id}`, e);
                    }
                }
            };

            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(runPreload);
            } else {
                setTimeout(runPreload, 2000); // Wait a bit for initial render
            }
        };

        preload();
    }, [events, isAdmin]);

    return null; // This component renders nothing
}
