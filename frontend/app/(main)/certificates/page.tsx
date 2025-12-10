import { Metadata } from "next";
import { MyCertificatesContent } from "@/components/certificates/my-certificates-content";

export const metadata: Metadata = {
    title: "Meus Certificados",
};

export default function MyCertificatesPage() {
    return <MyCertificatesContent />
}
