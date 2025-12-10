"use client"

import { useState, useEffect } from "react"
import { getMyCertificates, downloadCertificateByCode } from "@/lib/api"
import { Certificate } from "@/types/certificate"
import { Loader2, Download, ShieldCheck, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MyCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [downloadingCode, setDownloadingCode] = useState<string | null>(null)

    useEffect(() => {
        fetchCertificates()
    }, [])

    async function fetchCertificates() {
        try {
            const data = await getMyCertificates()
            setCertificates(data)
        } catch (error) {
            console.error("Failed to fetch certificates", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDownload(cert: Certificate) {
        setDownloadingCode(cert.code)
        try {
            const blob = await downloadCertificateByCode(cert.code)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const filename = `Certificado-${cert.code}.pdf`
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Failed to download certificate", error)
            alert("Erro ao baixar certificado.")
        } finally {
            setDownloadingCode(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Meus Certificados</h1>
                    <p className="text-gray-500 mt-2">Visualize e baixe seus certificados de participação.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : certificates.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {cert.code.substring(0, 8)}...
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={cert.eventName}>
                                        {cert.eventName}
                                    </h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>Realizado em: {format(new Date(cert.eventDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <FileText className="h-4 w-4" />
                                            <span>Emitido em: {format(new Date(cert.issuedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(cert)}
                                        disabled={downloadingCode === cert.code}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                                    >
                                        {downloadingCode === cert.code ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                        Baixar PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum certificado encontrado</h3>
                        <p className="text-gray-500 mt-2">Participe dos eventos para conquistar seus certificados.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
