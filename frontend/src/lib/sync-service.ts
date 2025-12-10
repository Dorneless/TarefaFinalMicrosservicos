import { eventsService, userService, certificateService } from './api';
import {
    getPendingActions,
    removePendingAction,
    updateActionStatus,
} from './offline-store';
import { PendingAction } from '@/types';

export interface SyncResult {
    success: boolean;
    actionId: string;
    error?: string;
}

// Process a single action
async function processAction(action: PendingAction): Promise<void> {
    switch (action.type) {
        case 'REGISTER_USER_TO_EVENT': {
            const { eventId, email } = action.payload as { eventId: string; email: string };
            await eventsService.post(`/events/${eventId}/register-by-email`, { email });
            break;
        }

        case 'MARK_ATTENDANCE': {
            const { registrationId, attended } = action.payload as {
                registrationId: string;
                attended: boolean;
            };
            await eventsService.post(`/registrations/${registrationId}/attendance`, {
                attended,
            });
            break;
        }

        case 'CREATE_USER': {
            const { name, email } = action.payload as { name: string; email: string };
            await userService.post('/admin/users', { name, email });
            break;
        }

        case 'CREATE_EVENT': {
            const eventData = action.payload;
            await eventsService.post('/events', eventData);
            break;
        }

        case 'ISSUE_CERTIFICATE': {
            const { eventId } = action.payload as { eventId: string };
            await certificateService.post('/issue', { eventId });
            break;
        }

        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}

// Sync a single action
export async function syncAction(action: PendingAction): Promise<SyncResult> {
    try {
        await updateActionStatus(action.id, 'syncing');
        await processAction(action);
        await removePendingAction(action.id);
        return { success: true, actionId: action.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updateActionStatus(action.id, 'failed', errorMessage);
        return { success: false, actionId: action.id, error: errorMessage };
    }
}

// Sync all pending actions
export async function syncAllActions(): Promise<SyncResult[]> {
    const actions = await getPendingActions();
    const pendingActions = actions.filter((a) => a.status === 'pending');
    const results: SyncResult[] = [];

    for (const action of pendingActions) {
        const result = await syncAction(action);
        results.push(result);

        // Small delay between actions to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
}

// Retry failed actions
export async function retryFailedActions(): Promise<SyncResult[]> {
    const actions = await getPendingActions();
    const failedActions = actions.filter((a) => a.status === 'failed');
    const results: SyncResult[] = [];

    for (const action of failedActions) {
        // Reset to pending before trying
        await updateActionStatus(action.id, 'pending');
        const result = await syncAction(action);
        results.push(result);
    }

    return results;
}
