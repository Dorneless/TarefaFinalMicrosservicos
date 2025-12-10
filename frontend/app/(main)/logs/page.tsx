import { Metadata } from "next";
import { LogsContent } from "@/components/admin/logs-content";

export const metadata: Metadata = {
    title: "Logs do Sistema",
};

export default function LogsPage() {
    return <LogsContent />
}
