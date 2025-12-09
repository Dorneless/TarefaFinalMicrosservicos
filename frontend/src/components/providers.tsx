"use client";

import { SessionProvider } from "next-auth/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "@/lib/react-query";

import { SyncProvider } from "@/contexts/sync-context";

import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {


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
