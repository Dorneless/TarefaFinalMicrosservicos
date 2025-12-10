"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSystemLogs, LogEntry } from "@/lib/api"
import { RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react"

export function LogsContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")

    const itemsPerPage = 20

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (session?.user?.role !== "ADMIN" && status === "authenticated") {
            router.push("/")
        } else if (session?.user?.role === "ADMIN") {
            loadLogs()
        }
    }, [status, session, router])

    async function loadLogs() {
        setLoading(true)
        try {
            const data = await getSystemLogs()
            // Sort by timestamp desc if not already
            const sorted = Array.isArray(data) ? data.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            }) : []
            setLogs(sorted)
        } catch (error) {
            console.error("Failed to load logs", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const currentLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const getStatusVariant = (code: number) => {
        if (code >= 200 && code < 300) return "bg-green-100 text-green-800 border-green-200"
        if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        if (code >= 500) return "bg-red-100 text-red-800 border-red-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Carregando logs...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-7xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Logs do Sistema</h1>
                        <p className="text-sm text-gray-500 mt-1">Monitoramento de todas as requisições da API</p>
                    </div>
                    <button onClick={loadLogs} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600" title="Atualizar">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search className="h-4 w-4 text-gray-400 ml-1" />
                        <input
                            type="text"
                            placeholder="Filtrar por url, email ou método..."
                            className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 w-[100px]">Método</th>
                                    <th className="px-4 py-3 w-[100px]">Status</th>
                                    <th className="px-4 py-3 w-[100px]">Service</th>
                                    <th className="px-4 py-3">Path</th>
                                    <th className="px-4 py-3">Usuário</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-500">
                                            Nenhum log encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    currentLogs.map((log) => (
                                        <tr key={log.id || Math.random()} className="hover:bg-blue-50/30 transition-colors bg-white">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-semibold border border-gray-200 bg-gray-50 px-2 py-1 rounded">
                                                    {log.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusVariant(log.statusCode)}`}>
                                                    {log.statusCode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {log.service || "frontend"}
                                            </td>
                                            <td className="px-4 py-3 max-w-[300px]">
                                                <div className="truncate font-mono text-xs text-gray-600" title={log.path}>
                                                    {log.path}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{log.userEmail}</span>
                                                    <span className="text-xs text-gray-400">{log.ip}</span>
                                                </div>
                                            </td >
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Página {page} de {totalPages || 1}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
