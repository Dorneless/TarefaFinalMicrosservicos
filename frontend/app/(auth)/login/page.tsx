"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, KeyRound } from "lucide-react"

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    code: z.string().optional(),
})

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get("message")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loginMethod, setLoginMethod] = useState<"password" | "code">("password")
    const [codeSent, setCodeSent] = useState(false)

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            code: ""
        }
    })

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        setLoading(true)
        setError(null)
        try {
            if (loginMethod === "password") {
                if (!data.password) {
                    form.setError("password", { message: "Senha obrigatória" })
                    setLoading(false)
                    return
                }

                const res = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                })

                if (res?.error) throw new Error("Credenciais inválidas")
                router.push("/")
                router.refresh()

            } else {
                // Code login
                if (!codeSent) {
                    // Request code
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_USER_URL}/api/auth/request-code`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: data.email }),
                    })

                    if (!res.ok) throw new Error("Erro ao enviar código (verifique se o email está cadastrado)")

                    setCodeSent(true)
                    // Keep loading false to allow user to type code
                } else {
                    // Submit code
                    if (!data.code) {
                        form.setError("code", { message: "Código obrigatório" })
                        setLoading(false)
                        return
                    }

                    const res = await signIn("credentials", {
                        email: data.email,
                        code: data.code,
                        redirect: false,
                    })

                    if (res?.error) throw new Error("Código inválido")
                    router.push("/")
                    router.refresh()
                }
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao entrar")
        } finally {
            if (!codeSent || (codeSent && loginMethod === 'code' && loading)) {
                setLoading(false)
            }
        }
    }

    return (
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-blue-600 p-6 text-center">
                <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
                <p className="text-blue-100 mt-2">Acesse sua conta para continuar</p>
            </div>

            <div className="p-6">
                {message === "registered" && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                        Conta criada com sucesso! Faça login.
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex mb-6 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => { setLoginMethod("password"); setCodeSent(false); setError(null); }}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${loginMethod === "password"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Senha
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginMethod("code"); setCodeSent(false); setError(null); }}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${loginMethod === "code"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Código de Acesso
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("email")}
                                type="email"
                                disabled={codeSent}
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder:text-gray-500"
                                placeholder="seu@email.com"
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {loginMethod === "password" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...form.register("password")}
                                    type="password"
                                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                    )}

                    {loginMethod === "code" && codeSent && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código Recebido</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...form.register("code")}
                                    type="text"
                                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                    placeholder="Digite o código"
                                />
                            </div>
                            {form.formState.errors.code && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.code.message}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setCodeSent(false)}
                                className="text-xs text-blue-600 hover:underline mt-2"
                            >
                                Enviar código novamente
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            loginMethod === "code" && !codeSent ? "Enviar Código" : "Entrar"
                        )}
                    </button>

                    <div className="text-center mt-4 text-sm text-gray-600">
                        Não tem uma conta? <a href="/register" className="text-blue-600 hover:underline">Registre-se</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
