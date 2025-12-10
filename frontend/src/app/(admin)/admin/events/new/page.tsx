'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, MapPin, Users, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { eventsService } from '@/lib/api';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingAction } from '@/lib/offline-store';
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

const eventSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    eventDate: z.string().min(1, 'Data é obrigatória'),
    location: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
    maxCapacity: z.coerce.number().min(1, 'Capacidade deve ser maior que 0'),
});

type EventForm = z.infer<typeof eventSchema>;

export default function NewEventPage() {
    const router = useRouter();
    const isOnline = useOnlineStatus();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EventForm>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            description: '',
            eventDate: '',
            location: '',
            maxCapacity: 100,
        },
    });

    const onSubmit = async (data: EventForm) => {
        setIsLoading(true);
        try {
            if (isOnline) {
                await eventsService.post('/events', data);
                toast.success('Evento criado com sucesso!');
                router.push('/admin/events');
            } else {
                await addPendingAction(
                    'CREATE_EVENT',
                    data,
                    `Criar evento: ${data.name}`
                );
                toast.info('Evento será criado quando você estiver online');
                router.push('/admin/events');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao criar evento';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Novo Evento</CardTitle>
                    <CardDescription>Preencha os dados para criar um novo evento</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Evento</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Ex: Workshop de React"
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
                            <Label htmlFor="description">Descrição</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <textarea
                                    id="description"
                                    placeholder="Descreva o evento..."
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...form.register('description')}
                                />
                            </div>
                            {form.formState.errors.description && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Data e Hora</Label>
                                <Input
                                    id="eventDate"
                                    type="datetime-local"
                                    {...form.register('eventDate')}
                                />
                                {form.formState.errors.eventDate && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.eventDate.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxCapacity">Capacidade Máxima</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="maxCapacity"
                                        type="number"
                                        min={1}
                                        className="pl-10"
                                        {...form.register('maxCapacity')}
                                    />
                                </div>
                                {form.formState.errors.maxCapacity && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.maxCapacity.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Local</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    placeholder="Ex: Auditório Principal"
                                    className="pl-10"
                                    {...form.register('location')}
                                />
                            </div>
                            {form.formState.errors.location && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.location.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    'Criar Evento'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
