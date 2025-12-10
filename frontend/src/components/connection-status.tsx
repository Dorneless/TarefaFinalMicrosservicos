'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { SyncManager } from './sync-manager';

export function ConnectionStatus() {
    const isOnline = useOnlineStatus();
    const { count } = usePendingActions();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80',
                        isOnline
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    )}
                >
                    {isOnline ? (
                        <Wifi className="h-4 w-4" />
                    ) : (
                        <WifiOff className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                    {count > 0 && (
                        <Badge
                            variant={isOnline ? 'default' : 'warning'}
                            className="ml-1 h-5 min-w-5 justify-center px-1.5"
                        >
                            {count}
                        </Badge>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isOnline ? (
                            <>
                                <Wifi className="h-5 w-5 text-green-500" />
                                Você está online
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-5 w-5 text-red-500" />
                                Você está offline
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {count > 0
                            ? `Você tem ${count} ação(ões) pendente(s) para sincronizar.`
                            : 'Todas as ações estão sincronizadas.'}
                    </DialogDescription>
                </DialogHeader>
                <SyncManager />
            </DialogContent>
        </Dialog>
    );
}
