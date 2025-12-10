"use client"

import { SessionProvider } from "next-auth/react"
import { QueryProvider } from "@/providers/query-provider"
import { OfflineProvider } from "@/context/offline-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                <OfflineProvider>
                    {children}
                </OfflineProvider>
            </QueryProvider>
        </SessionProvider>
    )
}
