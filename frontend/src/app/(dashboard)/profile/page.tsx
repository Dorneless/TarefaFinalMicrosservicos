'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, FileText, Loader2, Save } from 'lucide-react';
import { userService } from '@/lib/api';
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

const profileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    phone: z.string().optional(),
    document: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: session?.user?.name || '',
            phone: '',
            document: '',
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true);
        try {
            await userService.put('/users/me', data);
            toast.success('Perfil atualizado com sucesso!');
            // Update session
            await update({ name: data.name });
        } catch (error) {
            toast.error('Erro ao atualizar perfil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
                <p className="text-muted-foreground">
                    Gerencie suas informações pessoais
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                        Atualize seus dados de perfil
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="pl-10 bg-muted"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                O email não pode ser alterado
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Seu nome"
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
                            <Label htmlFor="phone">Telefone (opcional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    className="pl-10"
                                    {...form.register('phone')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="document">CPF (opcional)</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="document"
                                    placeholder="000.000.000-00"
                                    className="pl-10"
                                    {...form.register('document')}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
