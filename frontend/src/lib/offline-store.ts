import { get, set, del, keys } from 'idb-keyval';
import { PendingAction, PendingActionType } from '@/types';
import { generateId } from './utils';

const PENDING_ACTIONS_KEY = 'pending-actions';

// Get all pending actions
export async function getPendingActions(): Promise<PendingAction[]> {
    try {
        const actions = await get<PendingAction[]>(PENDING_ACTIONS_KEY);
        return actions || [];
    } catch (error) {
        console.error('Failed to get pending actions:', error);
        return [];
    }
}

// Add a new pending action
export async function addPendingAction(
    type: PendingActionType,
    payload: Record<string, unknown>,
    description: string,
    extra?: { eventId?: string; registrationId?: string }
): Promise<PendingAction> {
    const action: PendingAction = {
        id: generateId(),
        type,
        payload,
        description,
        createdAt: new Date().toISOString(),
        status: 'pending',
        eventId: extra?.eventId,
        registrationId: extra?.registrationId,
    };

    const actions = await getPendingActions();
    actions.push(action);
    await set(PENDING_ACTIONS_KEY, actions);

    return action;
}

// Update action status
export async function updateActionStatus(
    id: string,
    status: 'pending' | 'syncing' | 'failed',
    errorMessage?: string
): Promise<void> {
    const actions = await getPendingActions();
    const index = actions.findIndex((a) => a.id === id);

    if (index !== -1) {
        actions[index].status = status;
        if (errorMessage) {
            actions[index].errorMessage = errorMessage;
        }
        await set(PENDING_ACTIONS_KEY, actions);
    }
}

// Remove an action
export async function removePendingAction(id: string): Promise<void> {
    const actions = await getPendingActions();
    const filtered = actions.filter((a) => a.id !== id);
    await set(PENDING_ACTIONS_KEY, filtered);
}

// Remove all actions
export async function clearPendingActions(): Promise<void> {
    await del(PENDING_ACTIONS_KEY);
}

// Get count of pending actions
export async function getPendingActionsCount(): Promise<number> {
    const actions = await getPendingActions();
    return actions.filter((a) => a.status === 'pending').length;
}

// Cache management for offline data
const CACHE_PREFIX = 'cache-';

export async function setCache<T>(key: string, data: T): Promise<void> {
    await set(`${CACHE_PREFIX}${key}`, {
        data,
        timestamp: Date.now(),
    });
}

export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const cached = await get<{ data: T; timestamp: number }>(`${CACHE_PREFIX}${key}`);
        if (cached) {
            return cached.data;
        }
        return null;
    } catch {
        return null;
    }
}

export async function clearCache(): Promise<void> {
    const allKeys = await keys();
    for (const key of allKeys) {
        if (typeof key === 'string' && key.startsWith(CACHE_PREFIX)) {
            await del(key);
        }
    }
}
