'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Download, Loader2, FileText, ExternalLink } from 'lucide-react';
import { certificateService, certificateBaseUrl, eventsService } from '@/lib/api';
import { Certificate, EventRegistration } from '@/types';
import { formatDate } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { addPendingAction } from '@/lib/offline-store';
import { usePendingActions } from '@/hooks/use-pending-actions';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MyCertificatesPage() {
    const queryClient = useQueryClient();
    const isOnline = useOnlineStatus();
    const { refresh: refreshPending } = usePendingActions();

    // Fetch user's certificates
    const { data: certificates, isLoading: isLoadingCerts } = useQuery({
        queryKey: ['my-certificates'],
        queryFn: async () => {
            const response = await certificateService.get<Certificate[]>('/my-certificates');
            return response.data;
        },
    });

    // Fetch user's registrations (for issuing new certificates)
    const { data: registrations, isLoading: isLoadingRegs } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: async () => {
            const response = await eventsService.get<EventRegistration[]>('/my-events');
            return response.data;
        },
    });

    // Filter registrations that attended but don't have certificate yet
    const eligibleForCertificate = registrations?.filter(
        (reg) =>
            reg.attended &&
            reg.status === 'CONFIRMED' &&
            !certificates?.some((cert) => cert.eventId === reg.eventId)
    );

    const isLoading = isLoadingCerts || isLoadingRegs;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Meus Certificados</h1>
                <p className="text-muted-foreground">
                    Gerencie e baixe seus certificados de participação
                </p>
            </div>

            {/* Eligible for certificate */}
            {eligibleForCertificate && eligibleForCertificate.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Certificados Disponíveis para Emissão</CardTitle>
                        <CardDescription>
                            Você participou destes eventos e pode emitir seu certificado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {eligibleForCertificate.map((reg) => (
                            <EligibleCertificateCard
                                key={reg.id}
                                registration={reg}
                                isOnline={isOnline}
                                onIssue={() => {
                                    queryClient.invalidateQueries({ queryKey: ['my-certificates'] });
                                    refreshPending();
                                }}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            <Separator />

            {/* Existing certificates */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Certificados Emitidos</h2>

                {!certificates || certificates.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum certificado</h3>
                            <p className="text-muted-foreground">
                                Participe de eventos para ganhar certificados.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {certificates.map((certificate) => (
                            <CertificateCard key={certificate.id} certificate={certificate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EligibleCertificateCard({
    registration,
    isOnline,
    onIssue,
}: {
    registration: EventRegistration;
    isOnline: boolean;
    onIssue: () => void;
}) {
    const [isIssuing, setIsIssuing] = useState(false);

    const handleIssue = async () => {
        setIsIssuing(true);
        try {
            if (isOnline) {
                // Issue certificate online
                const response = await certificateService.post(
                    '/issue',
                    { eventId: registration.eventId },
                    { responseType: 'blob' }
                );

                // Download the PDF
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificado-${registration.eventName || registration.eventId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);

                toast.success('Certificado emitido com sucesso!');
                onIssue();
            } else {
                // Queue for offline
                await addPendingAction(
                    'ISSUE_CERTIFICATE',
                    { eventId: registration.eventId },
                    `Emitir certificado: ${registration.eventName || 'Evento'}`
                );
                toast.info('Certificado será emitido quando você estiver online');
                onIssue();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao emitir certificado';
            toast.error(message);
        } finally {
            setIsIssuing(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
                <p className="font-medium">{registration.eventName || 'Evento'}</p>
                <p className="text-sm text-muted-foreground">
                    Presença confirmada
                </p>
            </div>
            <Button onClick={handleIssue} disabled={isIssuing} size="sm">
                {isIssuing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Award className="h-4 w-4 mr-2" />
                        Emitir
                    </>
                )}
            </Button>
        </div>
    );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
    const handleDownload = () => {
        window.open(
            `${certificateBaseUrl}/certificates/download/${certificate.code}`,
            '_blank'
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{certificate.eventName}</CardTitle>
                        <CardDescription>
                            Emitido em {formatDate(certificate.issuedAt)}
                        </CardDescription>
                    </div>
                    <Badge variant="success">
                        <Award className="h-3 w-3 mr-1" />
                        Válido
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Código: </span>
                        <code className="font-mono bg-muted px-2 py-1 rounded">
                            {certificate.code}
                        </code>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
                        </Button>
                        <Link href={`/verify-certificate?code=${certificate.code}`}>
                            <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Verificar
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
