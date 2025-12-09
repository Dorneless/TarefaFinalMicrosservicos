"use client";

import { SessionProvider } from "next-auth/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "@/lib/react-query";

import { SyncProvider } from "@/contexts/sync-context";

import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    console.log('[SW-Cleaner] Unregistering Service Worker:', registration);
                    registration.unregister();
                }
                if (registrations.length === 0) {
                    console.log('[SW-Cleaner] No Service Workers found.');
                }
            });
        }
    }, []);

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            <SessionProvider>
                <SyncProvider>
                    {children}
                </SyncProvider>
            </SessionProvider>
        </PersistQueryClientProvider>
    );
}
