'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Search,
    Award,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    User,
} from 'lucide-react';
import axios from 'axios';
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
import { formatDate } from '@/lib/utils';

const verifySchema = z.object({
    code: z.string().min(1, 'Código é obrigatório'),
});

type VerifyForm = z.infer<typeof verifySchema>;

interface VerifyResult {
    valid: boolean;
    certificate?: {
        code: string;
        userName: string;
        eventName: string;
        eventDate: string;
        issuedAt: string;
    };
}

function VerifyCertificateContent() {
    const searchParams = useSearchParams();
    const initialCode = searchParams.get('code') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerifyResult | null>(null);

    const form = useForm<VerifyForm>({
        resolver: zodResolver(verifySchema),
        defaultValues: { code: initialCode },
    });

    // Auto-verify if code is in URL
    useEffect(() => {
        if (initialCode) {
            onSubmit({ code: initialCode });
        }
    }, [initialCode]);

    const onSubmit = async (data: VerifyForm) => {
        setIsLoading(true);
        setResult(null);

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_CERTIFICATE_API_BASE_URL || 'http://localhost:8083';
            const response = await axios.get(`${baseUrl}/certificates/verify/${data.code}`);

            setResult({
                valid: true,
                certificate: response.data,
            });
        } catch (error: any) {
            if (error.response?.status === 404) {
                setResult({ valid: false });
            } else {
                setResult({ valid: false });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Award className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold">Verificar Certificado</h1>
                    <p className="text-muted-foreground">
                        Insira o código do certificado para verificar sua autenticidade
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Código do Certificado</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="code"
                                            placeholder="CERT-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                                            className="pl-10 font-mono"
                                            {...form.register('code')}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Verificar'
                                        )}
                                    </Button>
                                </div>
                                {form.formState.errors.code && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.code.message}
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {result && (
                    <Card
                        className={
                            result.valid
                                ? 'border-green-500/50 bg-green-500/5'
                                : 'border-red-500/50 bg-red-500/5'
                        }
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                {result.valid ? (
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                ) : (
                                    <XCircle className="h-8 w-8 text-red-500" />
                                )}
                                <div>
                                    <CardTitle
                                        className={result.valid ? 'text-green-600' : 'text-red-600'}
                                    >
                                        {result.valid ? 'Certificado Válido' : 'Certificado Inválido'}
                                    </CardTitle>
                                    <CardDescription>
                                        {result.valid
                                            ? 'Este certificado é autêntico'
                                            : 'Este código não corresponde a nenhum certificado'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {result.valid && result.certificate && (
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Participante</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            <p className="font-medium">{result.certificate.userName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Evento</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <p className="font-medium">{result.certificate.eventName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Data do Evento</p>
                                        <p className="font-medium">
                                            {formatDate(result.certificate.eventDate)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Data de Emissão</p>
                                        <p className="font-medium">
                                            {formatDate(result.certificate.issuedAt)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function VerifyCertificatePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <VerifyCertificateContent />
        </Suspense>
    );
}
