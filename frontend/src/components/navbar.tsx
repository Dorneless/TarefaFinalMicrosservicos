"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { User, LogOut, ChevronDown, Calendar, Ticket, ShieldCheck, Search, Menu, X } from "lucide-react"

export function Navbar() {
    const { data: session, status } = useSession()
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveMenu(null)
                setIsMobileMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleMenu = (menu: string) => {
        setActiveMenu(activeMenu === menu ? null : menu)
    }

    const closeMenu = () => {
        setActiveMenu(null)
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all" ref={navRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Left: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group" onClick={closeMenu}>
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                                <Ticket className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">EventosApp</span>
                        </Link>
                    </div>

                    {/* Center: Navigation Menus (Desktop) */}
                    <div className="hidden md:flex flex-1 items-center justify-center gap-4">
                        {/* Eventos Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('events')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none
                                    ${activeMenu === 'events'
                                        ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100 ring-opacity-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Calendar className="h-4 w-4" />
                                Eventos
                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeMenu === 'events' ? 'rotate-180' : ''}`} />
                            </button>

                            {activeMenu === 'events' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Navegação</p>
                                    </div>
                                    <div className="p-1.5">
                                        <Link
                                            href="/"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg group"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors">
                                                <Ticket className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-medium block">Ver eventos</span>
                                                <span className="text-xs text-gray-500 font-normal">Explore todos os eventos</span>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/registrations"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg group"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors">
                                                <Calendar className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-medium block">Minhas inscrições</span>
                                                <span className="text-xs text-gray-500 font-normal">Gerencie sua presença</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Certificados Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => toggleMenu('certificates')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none
                                    ${activeMenu === 'certificates'
                                        ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100 ring-opacity-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Certificados
                                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeMenu === 'certificates' ? 'rotate-180' : ''}`} />
                            </button>

                            {activeMenu === 'certificates' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Ações</p>
                                    </div>
                                    <div className="p-1.5">
                                        <Link
                                            href="/certificates"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg group"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors">
                                                <ShieldCheck className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-medium block">Meus Certificados</span>
                                                <span className="text-xs text-gray-500 font-normal">Visualize suas conquistas</span>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/verify-certificate"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg group"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-100 transition-colors">
                                                <Search className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-medium block">Validar Certificado</span>
                                                <span className="text-xs text-gray-500 font-normal">Autenticidade de documentos</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: User Menu (Desktop) */}
                    <div className="hidden md:flex items-center justify-end flex-shrink-0">
                        {status === "loading" ? (
                            <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
                        ) : session ? (
                            <div className="relative">
                                <button
                                    onClick={() => toggleMenu('user')}
                                    className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-all duration-200
                                        ${activeMenu === 'user'
                                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 ring-opacity-50'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                        {session.user?.name || "Usuário"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeMenu === 'user' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeMenu === 'user' && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{session.user?.email}</p>
                                        </div>

                                        <div className="p-1.5">
                                            <Link
                                                href="/profile"
                                                onClick={closeMenu}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <User className="h-4 w-4 text-gray-500" />
                                                Meu Perfil
                                            </Link>

                                            <div className="my-1 border-t border-gray-100"></div>

                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={closeMenu}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow hover:scale-105 active:scale-95"
                                >
                                    Criar Conta
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center ml-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Mobile Navigation */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Eventos</h3>
                                <div className="space-y-1">
                                    <Link
                                        href="/"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Ticket className="h-5 w-5" />
                                        Ver eventos
                                    </Link>
                                    <Link
                                        href="/registrations"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        Minhas inscrições
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Certificados</h3>
                                <div className="space-y-1">
                                    <Link
                                        href="/certificates"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                        Meus Certificados
                                    </Link>
                                    <Link
                                        href="/verify-certificate"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Search className="h-5 w-5" />
                                        Validar Certificado
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile User Section */}
                        <div className="pt-4 border-t border-gray-100">
                            {status === "loading" ? (
                                <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
                            ) : session ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            href="/profile"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <User className="h-5 w-5" />
                                            Meu Perfil
                                        </Link>

                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/login" onClick={closeMenu} className="flex items-center justify-center py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                        Entrar
                                    </Link>
                                    <Link href="/register" onClick={closeMenu} className="flex items-center justify-center py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                                        Criar Conta
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
