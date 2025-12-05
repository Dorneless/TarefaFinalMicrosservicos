import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { get, set, del } from "idb-keyval";

const createIDBPersister = (idbValidKey: IDBValidKey = "reactQuery") => {
    return {
        persistClient: async (client: QueryClient) => {
            set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<QueryClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } as any;
};

// We need a custom persister that works with idb-keyval for async storage
// But @tanstack/query-sync-storage-persister is for synchronous storage like localStorage.
// For IndexedDB, we should use the experimental createAsyncStoragePersister or build a simple one.
// Actually, persist-client expects a persister interface.

// Let's use the official pattern for async storage (IndexedDB)
// Ref: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 0, // Always stale (Network First strategy)
        },
    },
});

export const persister = {
    persistClient: async (client: any) => {
        await set("reactQueryClient", client);
    },
    restoreClient: async () => {
        return await get("reactQueryClient");
    },
    removeClient: async () => {
        await del("reactQueryClient");
    },
};
