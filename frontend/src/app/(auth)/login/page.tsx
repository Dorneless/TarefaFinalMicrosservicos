'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Key, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { userService } from '@/lib/api';

const passwordSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

const codeSchema = z.object({
    email: z.string().email('Email inválido'),
    code: z.string().min(6, 'Código deve ter 6 dígitos').max(6, 'Código deve ter 6 dígitos'),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type CodeForm = z.infer<typeof codeSchema>;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeEmail, setCodeEmail] = useState('');

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { email: '', password: '' },
    });

    const codeForm = useForm<CodeForm>({
        resolver: zodResolver(codeSchema),
        defaultValues: { email: '', code: '' },
    });

    const onPasswordSubmit = async (data: PasswordForm) => {
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Email ou senha incorretos');
            } else {
                toast.success('Login realizado com sucesso!');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const onRequestCode = async () => {
        const email = codeForm.getValues('email');

        if (!email) {
            codeForm.setError('email', { message: 'Email é obrigatório' });
            return;
        }

        const emailResult = z.string().email().safeParse(email);
        if (!emailResult.success) {
            codeForm.setError('email', { message: 'Email inválido' });
            return;
        }

        setIsSendingCode(true);
        try {
            await userService.post('/auth/request-code', { email });
            toast.success('Código enviado para seu email!');
            setCodeSent(true);
            setCodeEmail(email);
        } catch (error) {
            toast.error('Erro ao enviar código. Verifique o email e tente novamente.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const onCodeSubmit = async (data: CodeForm) => {
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                code: data.code,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Código inválido ou expirado');
            } else {
                toast.success('Login realizado com sucesso!');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Lock className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
                <CardDescription>
                    Escolha como deseja acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="password" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="password" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Senha
                        </TabsTrigger>
                        <TabsTrigger value="code" className="gap-2">
                            <Key className="h-4 w-4" />
                            Código
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="password">
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        {...passwordForm.register('email')}
                                    />
                                </div>
                                {passwordForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {passwordForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        {...passwordForm.register('password')}
                                    />
                                </div>
                                {passwordForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                        {passwordForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="code">
                        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="code-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        disabled={codeSent}
                                        {...codeForm.register('email')}
                                    />
                                </div>
                                {codeForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {codeForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            {!codeSent ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={onRequestCode}
                                    disabled={isSendingCode}
                                >
                                    {isSendingCode ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Código
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Código de Verificação</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="code"
                                                type="text"
                                                placeholder="000000"
                                                className="pl-10 text-center tracking-widest text-lg"
                                                maxLength={6}
                                                {...codeForm.register('code')}
                                            />
                                        </div>
                                        {codeForm.formState.errors.code && (
                                            <p className="text-sm text-destructive">
                                                {codeForm.formState.errors.code.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Código enviado para {codeEmail}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setCodeSent(false);
                                                setCodeEmail('');
                                                codeForm.reset();
                                            }}
                                        >
                                            Trocar Email
                                        </Button>
                                        <Button type="submit" className="flex-1" disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Entrar'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Não tem uma conta?
                        </span>
                    </div>
                </div>
                <Link href="/register" className="w-full">
                    <Button variant="outline" className="w-full">
                        Criar Conta
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    );
}
