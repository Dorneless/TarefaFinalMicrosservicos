"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { certificateApi } from "@/lib/api";
import { Certificate } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MyCertificatesPage() {
    const { data: certificates = [], isLoading: loading } = useQuery({
        queryKey: ["my-certificates"],
        queryFn: async () => {
            const response = await certificateApi.get<Certificate[]>("/certificates/my-certificates");
            return response.data;
        },
    });

    const handleDownloadCertificate = async (code: string) => {
        try {
            const response = await certificateApi.get(`/certificates/download/${code}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${code}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download certificate:", error);
            toast.error("Falha ao baixar certificado.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Certificados</h1>
                <p className="text-muted-foreground">
                    Visualize e baixe seus certificados conquistados.
                </p>
            </div>

            {certificates.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Você ainda não tem certificados.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {certificates.map((cert) => (
                        <Card key={cert.id} className="border-yellow-500/50 bg-yellow-50/10 dark:bg-yellow-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    Certificado
                                </CardTitle>
                                <CardDescription>
                                    Emitido em {format(new Date(cert.issuedAt), "PPP", { locale: ptBR })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Código: {cert.code}</p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleDownloadCertificate(cert.code)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar PDF
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
