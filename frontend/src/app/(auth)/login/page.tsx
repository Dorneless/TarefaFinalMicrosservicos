"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { userService } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { persister } from "@/lib/react-query";

const formSchema = z.object({
    email: z.string().email({ message: "Endereço de email inválido" }),
    password: z.string().optional(),
    code: z.string().optional(),
});

export default function LoginPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [loginMode, setLoginMode] = useState<"password" | "code">("password");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            code: "",
        },
    });

    async function onRequestCode() {
        const email = form.getValues("email");
        if (!email) {
            form.setError("email", { message: "Email é obrigatório para solicitar o código" });
            return;
        }

        // Basic email validation
        const emailSchema = z.string().email();
        const result = emailSchema.safeParse(email);
        if (!result.success) {
            form.setError("email", { message: "Endereço de email inválido" });
            return;
        }

        setIsLoading(true);
        try {
            await userService.post("/auth/request-code", { email });
            toast.success("Código de verificação enviado para seu email!");
            setLoginMode("code");
        } catch (error) {
            console.error("Failed to request code:", error);
            toast.error("Falha ao enviar código de verificação. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        // Clear cache before login to ensure fresh state
        await persister.removeClient();
        queryClient.removeQueries();

        try {
            let result;
            if (loginMode === "password") {
                if (!values.password) {
                    form.setError("password", { message: "Senha é obrigatória" });
                    setIsLoading(false);
                    return;
                }
                result = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });
            } else {
                if (!values.code) {
                    form.setError("code", { message: "Código é obrigatório" });
                    setIsLoading(false);
                    return;
                }
                result = await signIn("credentials", {
                    email: values.email,
                    code: values.code,
                    redirect: false,
                });
            }

            if (result?.error) {
                toast.error("Login falhou. Verifique suas credenciais.");
            } else {
                toast.success("Login realizado com sucesso!");
                router.push("/");
            }
        } catch (error) {
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Entrar</CardTitle>
                    <CardDescription>Insira suas credenciais para acessar sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2 mb-4">
                        <Button
                            type="button"
                            variant={loginMode === "password" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setLoginMode("password")}
                        >
                            Senha
                        </Button>
                        <Button
                            type="button"
                            variant={loginMode === "code" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setLoginMode("code")}
                        >
                            Código de Acesso
                        </Button>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@exemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {loginMode === "password" ? (
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="******" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Código de Verificação</FormLabel>
                                                <div className="flex space-x-2">
                                                    <FormControl>
                                                        <Input placeholder="123456" {...field} />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={onRequestCode}
                                                        disabled={isLoading}
                                                    >
                                                        Enviar Código
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-blue-500 hover:underline">
                            Cadastre-se
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
