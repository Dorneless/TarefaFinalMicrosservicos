"use client"

import { useState, useEffect } from "react"
import { getMyRegistrations, generateCertificate, cancelRegistration, getMyCertificates, sendCertificateIssuedNotification } from "@/lib/api"
import { EventRegistrationResponseDTO } from "@/types/registrations"
import { Loader2, Calendar, MapPin, CheckCircle, Clock, Download } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<EventRegistrationResponseDTO[]>([])
    const [generatingCertId, setGeneratingCertId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRegistrations()
    }, [])

    async function fetchRegistrations() {
        try {
            const data = await getMyRegistrations()
            setRegistrations(data)
        } catch (error) {
            console.error("Failed to fetch registrations", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCancelRegistration(registrationId: string) {
        if (!confirm("Tem certeza que deseja cancelar sua inscrição neste evento?")) return

        try {
            await cancelRegistration(registrationId)
            alert("Inscrição cancelada com sucesso!")
            fetchRegistrations() // Refresh list
        } catch (error) {
            console.error("Failed to cancel registration", error)
            alert("Erro ao cancelar inscrição. Tente novamente.")
        }
    }

    async function handleGenerateCertificate(eventId: string, eventName: string) {
        setGeneratingCertId(eventId)
        try {
            const blob = await generateCertificate(eventId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const filename = `Certificado-${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            // Send notification
            // We need the certificate code. Fetch my certificates to find it.
            try {
                const certificates = await getMyCertificates()
                const cert = certificates.find((c: any) => c.eventId === eventId)

                if (cert) {
                    await sendCertificateIssuedNotification({
                        email: cert.userEmail,
                        userName: cert.userName,
                        eventName: cert.eventName,
                        certificateCode: cert.code,
                        pdfPath: ""
                    })
                }
            } catch (err) {
                console.error("Failed to send notification", err)
            }

        } catch (error) {
            console.error("Failed to generate certificate", error)
            alert("Erro ao gerar certificado. Tente novamente.")
        } finally {
            setGeneratingCertId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Minhas Inscrições</h1>
                    <p className="text-gray-500 mt-2">Acompanhe os eventos em que você está inscrito.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : registrations.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{reg.eventName}</h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Calendar className="h-4 w-4" />
                                        <span>Inscrito em: {format(new Date(reg.registeredAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${reg.attended
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {reg.attended ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    Presença Confirmada
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="h-4 w-4" />
                                                    Inscrito
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!reg.attended && (
                                                <button
                                                    onClick={() => handleCancelRegistration(reg.id)}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                            {reg.attended && (
                                                <button
                                                    onClick={() => handleGenerateCertificate(reg.eventId, reg.eventName)}
                                                    disabled={generatingCertId === reg.eventId}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {generatingCertId === reg.eventId ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                    Gerar Certificado
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">Você ainda não está inscrito em nenhum evento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
