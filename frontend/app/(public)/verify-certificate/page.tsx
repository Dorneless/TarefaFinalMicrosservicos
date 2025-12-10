"use client"

import { useState } from "react"
import { verifyCertificate } from "@/lib/api"
import { Certificate } from "@/types/certificate"
import { Loader2, Search, CheckCircle, XCircle, Calendar, User, FileText, QrCode } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function VerifyCertificatePage() {
    const [code, setCode] = useState("")
    const [result, setResult] = useState<Certificate | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)
        setHasSearched(false)

        try {
            const data = await verifyCertificate(code.trim())
            if (data) {
                setResult(data)
            } else {
                setError("Certificado não encontrado ou inválido.")
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Erro ao verificar certificado.")
        } finally {
            setLoading(false)
            setHasSearched(true)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <QrCode className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Validar Certificado
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Digite o código único do certificado para verificar sua autenticidade.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Código do Certificado
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="code"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                                    placeholder="Ex: CERT-123..."
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !code.trim()}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verificar"}
                            </button>
                        </div>
                    </form>

                    {hasSearched && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            {result ? (
                                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">Certificado Válido</h3>
                                            <div className="mt-4 text-sm text-green-700 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 opacity-70" />
                                                    <span className="font-semibold">{result.userName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 opacity-70" />
                                                    <span>Evento: {result.eventName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 opacity-70" />
                                                    <span>Data do Evento: {format(new Date(result.eventDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                </div>
                                                <div className="text-xs text-green-600 mt-2">
                                                    Emitido em: {format(new Date(result.issuedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Certificado Inválido</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
