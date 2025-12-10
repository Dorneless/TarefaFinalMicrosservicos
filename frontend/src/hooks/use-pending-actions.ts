'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingActions, getPendingActionsCount } from '@/lib/offline-store';
import { PendingAction } from '@/types';

export function usePendingActions() {
    const [actions, setActions] = useState<PendingAction[]>([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const allActions = await getPendingActions();
            const pendingCount = await getPendingActionsCount();
            setActions(allActions);
            setCount(pendingCount);
        } catch (error) {
            console.error('Failed to load pending actions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        actions,
        count,
        isLoading,
        refresh,
    };
}
