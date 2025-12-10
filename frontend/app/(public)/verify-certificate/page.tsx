import { Metadata } from "next";
import { VerifyCertificateContent } from "@/components/public/verify-certificate-content";

export const metadata: Metadata = {
    title: "Verificar Certificado",
};

export default function VerifyCertificatePage() {
    return <VerifyCertificateContent />
}
