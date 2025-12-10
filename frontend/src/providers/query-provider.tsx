import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { useState } from "react"
import { get, set, del } from "idb-keyval"

// Basic functional wrapper to use idb-keyval with the synchronous persister interface
// Note: createSyncStoragePersister usually expects synchronous storage like localStorage.
// But we want to use IndexedDB which is async.
// Actually, `PersistQueryClientProvider` works with an async `persister`.
// We should use `createAsyncStoragePersister` if it exists, or just implement the interface manually.
// Let's check the docs pattern. 
// standard pattern:
/*
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
})
*/
// Except `@tanstack/query-async-storage-persister` is a separate package. I didn't ask to install it.
// I can implement the persister interface directly.

const createIDBPersister = (idbKey = "react-query") => {
    return {
        persistClient: async (client: any) => {
            await set(idbKey, client)
        },
        restoreClient: async () => {
            return await get(idbKey)
        },
        removeClient: async () => {
            await del(idbKey)
        },
    } as any
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: 1, // Only retry once to fail fast when offline
                        refetchOnWindowFocus: false, // Don't refetch on window focus to avoid overwriting cache when offline
                    },
                },
            })
    )

    const [persister] = useState(() => createIDBPersister())

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
