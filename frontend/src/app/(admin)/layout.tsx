import { Navbar } from "@/components/navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container py-6">{children}</main>
        </div>
    );
}
