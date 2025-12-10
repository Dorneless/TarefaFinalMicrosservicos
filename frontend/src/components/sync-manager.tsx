'use client';

import { useState } from 'react';
import { RefreshCw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { syncAllActions } from '@/lib/sync-service';
import { removePendingAction } from '@/lib/offline-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';

export function SyncManager() {
    const isOnline = useOnlineStatus();
    const { actions, count, refresh } = usePendingActions();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncAll = async () => {
        if (!isOnline) {
            toast.error('Você precisa estar online para sincronizar.');
            return;
        }

        setIsSyncing(true);
        try {
            const results = await syncAllActions();
            const successCount = results.filter((r) => r.success).length;
            const failCount = results.filter((r) => !r.success).length;

            if (successCount > 0) {
                toast.success(`${successCount} ação(ões) sincronizada(s) com sucesso!`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} ação(ões) falharam. Tente novamente.`);
            }

            await refresh();
        } catch (error) {
            toast.error('Erro ao sincronizar ações.');
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRemoveAction = async (id: string) => {
        try {
            await removePendingAction(id);
            await refresh();
            toast.success('Ação removida.');
        } catch (error) {
            toast.error('Erro ao remover ação.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pendente</Badge>;
            case 'syncing':
                return <Badge variant="secondary">Sincronizando...</Badge>;
            case 'failed':
                return <Badge variant="destructive">Falhou</Badge>;
            default:
                return null;
        }
    };

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'REGISTER_USER_TO_EVENT':
                return '👤';
            case 'MARK_ATTENDANCE':
                return '✓';
            case 'CREATE_USER':
                return '➕';
            case 'CREATE_EVENT':
                return '📅';
            case 'ISSUE_CERTIFICATE':
                return '📜';
            default:
                return '📝';
        }
    };

    if (actions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">
                    Todas as ações estão sincronizadas!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {count} ação(ões) pendente(s)
                </p>
                <Button
                    onClick={handleSyncAll}
                    disabled={!isOnline || isSyncing || count === 0}
                    size="sm"
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`}
                    />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
                </Button>
            </div>

            <Separator />

            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                    {actions.map((action) => (
                        <div
                            key={action.id}
                            className="flex items-start justify-between gap-4 rounded-lg border p-3"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getActionIcon(action.type)}</span>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{action.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(action.createdAt)}
                                    </p>
                                    {action.errorMessage && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {action.errorMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(action.status)}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveAction(action.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
