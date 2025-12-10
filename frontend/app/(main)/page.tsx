import { Metadata } from "next";
import { EventsPageContent } from "@/components/events/events-page-content";

export const metadata: Metadata = {
    title: "Eventos",
};

export default function EventsPage() {
    return <EventsPageContent />
}
