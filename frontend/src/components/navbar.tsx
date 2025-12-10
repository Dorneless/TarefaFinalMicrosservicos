"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { User, LogOut, ChevronDown, Calendar, Ticket, ShieldCheck, Search } from "lucide-react"

export function Navbar() {
    const { data: session, status } = useSession()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Nav */}
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Ticket className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">EventosApp</span>
                        </Link>

                        <div className="relative group/events h-full flex items-center" >
                            <button className="flex items-center gap-1.5 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50">
                                <Calendar className="h-4 w-4" />
                                Eventos
                                <ChevronDown className="h-3 w-3 text-gray-400 group-hover/events:text-gray-600 transition-colors" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-xl shadow-xl py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover/events:block animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="px-2 pb-2 mb-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 pt-2">Navegação</p>
                                </div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                >
                                    <Ticket className="h-4 w-4" />
                                    Ver eventos
                                </Link>
                                <Link
                                    href="/registrations"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Minhas inscrições
                                </Link>
                            </div>
                        </div>

                        <div className="relative group/certificates h-full flex items-center ml-2">
                            <button className="flex items-center gap-1.5 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50">
                                <ShieldCheck className="h-4 w-4" />
                                Certificados
                                <ChevronDown className="h-3 w-3 text-gray-400 group-hover/certificates:text-gray-600 transition-colors" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-xl shadow-xl py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover/certificates:block animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="px-2 pb-2 mb-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 pt-2">Ações</p>
                                </div>
                                <Link
                                    href="/certificates"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Meus Certificados
                                </Link>
                                <Link
                                    href="/verify-certificate"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                                >
                                    <Search className="h-4 w-4" />
                                    Validar Certificado
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center">
                        {status === "loading" ? (
                            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-md"></div>
                        ) : session ? (
                            <div className="ml-3 relative" ref={dropdownRef}>
                                <div>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="max-w-xs bg-white flex items-center gap-2 text-sm focus:outline-none group cursor-pointer"
                                    >
                                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium border border-blue-200 group-hover:bg-blue-200 transition-colors">
                                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                        <span className="hidden md:block font-medium text-gray-700 group-hover:text-gray-900">
                                            {session.user?.name || "Usuário"}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {isDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Meu Perfil
                                        </Link>

                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                                    Entrar
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                                >
                                    Criar Conta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
