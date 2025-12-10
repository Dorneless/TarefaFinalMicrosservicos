import { Metadata } from "next";
import { RegistrationsContent } from "@/components/registrations/registrations-content";

export const metadata: Metadata = {
    title: "Minhas Inscrições",
};

export default function RegistrationsPage() {
    return <RegistrationsContent />
}
