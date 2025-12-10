import { Navbar } from "@/components/navbar"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} EventosApp. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    )
}
