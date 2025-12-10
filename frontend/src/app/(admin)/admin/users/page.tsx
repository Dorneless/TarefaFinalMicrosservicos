'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';
import { userService } from '@/lib/api';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingAction } from '@/lib/offline-store';
import { usePendingActions } from '@/hooks/use-pending-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const userSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
});

type UserForm = z.infer<typeof userSchema>;

export default function AdminUsersPage() {
    const isOnline = useOnlineStatus();
    const { refresh: refreshPending } = usePendingActions();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    });

    const onSubmit = async (data: UserForm) => {
        setIsLoading(true);
        setSuccess(false);

        try {
            if (isOnline) {
                await userService.post('/admin/users', data);
                toast.success('Usuário criado com sucesso!');
                setSuccess(true);
            } else {
                await addPendingAction(
                    'CREATE_USER',
                    data,
                    `Criar usuário: ${data.name} (${data.email})`
                );
                await refreshPending();
                toast.info('Usuário será criado quando você estiver online');
                setSuccess(true);
            }

            form.reset();
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error('Este email já está em uso');
                form.setError('email', { message: 'Email já cadastrado' });
            } else {
                const message = error.response?.data?.message || 'Erro ao criar usuário';
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Cadastrar Usuário</h1>
                <p className="text-muted-foreground">
                    Crie um novo usuário no sistema. Ele poderá fazer login usando código temporário.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Novo Usuário
                    </CardTitle>
                    <CardDescription>
                        O usuário receberá um email para definir sua senha ou poderá usar código temporário para login.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                            <h3 className="text-lg font-semibold">Usuário criado com sucesso!</h3>
                            <p className="text-muted-foreground">
                                O usuário poderá fazer login usando código temporário enviado por email.
                            </p>
                            <Button onClick={() => setSuccess(false)}>
                                Cadastrar outro usuário
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Nome do usuário"
                                        className="pl-10"
                                        {...form.register('name')}
                                    />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="pl-10"
                                        {...form.register('email')}
                                    />
                                </div>
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Criar Usuário
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
