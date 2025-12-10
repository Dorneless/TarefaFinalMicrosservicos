"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Shield, Phone } from "lucide-react"
import { updateUser } from "@/lib/api"

export function ProfileContent() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        document: "",
        phone: ""
    })

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                document: "", // Session might not have these details by default, usually need to fetch full profile or these are in token
                phone: ""
            })
            // If we need to fetch full profile to get document/phone, we might need a getUserProfile API call defined later.
            // For now, let's assume session might have them or we start empty/from session extended fields.
        }
    }, [session])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        try {
            await updateUser({
                name: formData.name,
                document: formData.document,
                phone: formData.phone
            })

            // Update session client-side to reflect new name immediately if possible
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: formData.name
                }
            })

            alert("Perfil atualizado com sucesso!")
        } catch (error) {
            console.error("Failed to update profile", error)
            alert("Erro ao atualizar perfil.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 flex items-center">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
                        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="ml-6 text-white">
                        <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                        <p className="opacity-90">{session?.user?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome Completo</label>
                            <div className="flex items-center gap-3 mt-2">
                                <User className="h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-gray-700 font-medium w-full"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 opacity-75 cursor-not-allowed">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email (Não editável)</label>
                            <div className="flex items-center gap-3 mt-2">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-gray-500">{formData.email}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documento (CPF/RG)</label>
                            <div className="flex items-center gap-3 mt-2">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-gray-700 font-medium w-full"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</label>
                            <div className="flex items-center gap-3 mt-2">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-transparent border-none focus:ring-0 p-0 text-gray-700 font-medium w-full"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Conta</label>
                            <div className="flex items-center gap-3 mt-2">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-gray-700">{session?.user?.role || "Usuário"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
