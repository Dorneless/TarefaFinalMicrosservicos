"use client";

import { useState } from "react";
import { certificateApi } from "@/lib/api";
import { Certificate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navbar } from "@/components/navbar";

export default function VerifyCertificatePage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError(null);
        setCertificate(null);
        setSearched(true);

        try {
            const response = await certificateApi.get<Certificate>(`/certificates/verify/${code}`);
            setCertificate(response.data);
        } catch (err: any) {
            console.error("Verification failed:", err);
            if (err.response?.status === 404) {
                setError("Certificado não encontrado ou inválido.");
            } else {
                setError("Erro ao verificar certificado. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Verificar Certificado</h1>
                        <p className="text-muted-foreground">
                            Digite o código do certificado para verificar sua autenticidade.
                        </p>
                    </div>

                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Validar Código</CardTitle>
                            <CardDescription>Insira o código UUID ou o código completo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Ex: CERT-..."
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={loading || !code.trim()}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {searched && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {certificate ? (
                                <Card className="border-green-500/50 bg-green-50/10 dark:bg-green-900/10">
                                    <CardHeader>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                            <CheckCircle className="h-6 w-6" />
                                            <span className="font-semibold text-lg">Certificado Válido</span>
                                        </div>
                                        <CardTitle>{certificate.eventName}</CardTitle>
                                        <CardDescription>
                                            Conferido a <span className="font-medium text-foreground">{certificate.userName}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Data do Evento:</span>
                                            <span>{format(new Date(certificate.eventDate), "PPP", { locale: ptBR })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Data de Emissão:</span>
                                            <span>{format(new Date(certificate.issuedAt), "PPP", { locale: ptBR })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Código:</span>
                                            <span className="font-mono text-xs">{certificate.code}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card className="border-red-500/50 bg-red-50/10 dark:bg-red-900/10">
                                    <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                                        <XCircle className="h-12 w-12 text-red-500" />
                                        <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Inválido</h3>
                                        <p className="text-muted-foreground">{error}</p>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
