"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, User, Phone, FileText } from "lucide-react"

const registerSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    phone: z.string().optional(),
    document: z.string().optional(),
})

export function RegisterForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: z.infer<typeof registerSchema>) {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_USER_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => null)
                throw new Error(errData?.message || "Erro ao criar conta")
            }

            // Success
            router.push("/login?message=registered")
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao criar conta")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-green-600 p-6 text-center">
                <h1 className="text-2xl font-bold text-white">Crie sua Conta</h1>
                <p className="text-green-100 mt-2">Junte-se a nós hoje mesmo</p>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("name")}
                                type="text"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                placeholder="Seu Nome"
                            />
                        </div>
                        {form.formState.errors.name && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("email")}
                                type="email"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                placeholder="seu@email.com"
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("password")}
                                type="password"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                placeholder="••••••••"
                            />
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (Opcional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("phone")}
                                type="tel"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                placeholder="+55 11 99999-9999"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento (Opcional)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                {...form.register("document")}
                                type="text"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                placeholder="CPF/RG"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Conta"}
                    </button>

                    <div className="text-center mt-4 text-sm text-gray-600">
                        Já tem uma conta? <a href="/login" className="text-green-600 hover:underline">Faça login</a>
                    </div>
                </form>
            </div>
        </div>
    )
}
