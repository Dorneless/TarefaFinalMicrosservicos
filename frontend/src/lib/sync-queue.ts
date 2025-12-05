import { get, set } from "idb-keyval";

export type SyncActionType = "REGISTER_BY_EMAIL" | "MARK_ATTENDANCE";

export interface SyncAction {
    id: string;
    type: SyncActionType;
    payload: any;
    createdAt: number;
}

const QUEUE_KEY = "offline_sync_queue";

export class SyncQueue {
    static async enqueue(action: Omit<SyncAction, "id" | "createdAt">): Promise<SyncAction> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        const newAction: SyncAction = {
            ...action,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        };
        queue.push(newAction);
        await set(QUEUE_KEY, queue);
        return newAction;
    }

    static async peek(): Promise<SyncAction | undefined> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        return queue[0];
    }

    static async dequeue(): Promise<SyncAction | undefined> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        if (queue.length === 0) return undefined;
        const action = queue.shift();
        await set(QUEUE_KEY, queue);
        return action;
    }

    static async getAll(): Promise<SyncAction[]> {
        return (await get<SyncAction[]>(QUEUE_KEY)) || [];
    }

    static async update(id: string, updates: Partial<SyncAction>): Promise<void> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        const index = queue.findIndex((a) => a.id === id);
        if (index !== -1) {
            queue[index] = { ...queue[index], ...updates };
            await set(QUEUE_KEY, queue);
        }
    }

    static async updatePayload(id: string, payloadUpdates: any): Promise<void> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        const index = queue.findIndex((a) => a.id === id);
        if (index !== -1) {
            queue[index].payload = { ...queue[index].payload, ...payloadUpdates };
            await set(QUEUE_KEY, queue);
        }
    }

    static async remove(id: string): Promise<void> {
        const queue = (await get<SyncAction[]>(QUEUE_KEY)) || [];
        const newQueue = queue.filter((a) => a.id !== id);
        await set(QUEUE_KEY, newQueue);
    }

    static async clear(): Promise<void> {
        await set(QUEUE_KEY, []);
    }
}
