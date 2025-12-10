"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Calendar, Award, UserCircle, Menu, CheckCircle, RefreshCw, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSync } from "@/contexts/sync-context";
import { useQueryClient } from "@tanstack/react-query";
import { persister } from "@/lib/react-query";

export function Navbar() {
    const { data: session } = useSession();
    const { queueSize, isOnline, sync, isSyncing } = useSync();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        await persister.removeClient();
        queryClient.removeQueries();
        signOut();
    };

    const links = [
        { href: "/", label: "Eventos", icon: Calendar },
        { href: "/my-registrations", label: "Minhas Inscrições", icon: User },
        { href: "/my-certificates", label: "Meus Certificados", icon: Award },
        { href: "/verify-certificate", label: "Verificar", icon: CheckCircle },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <div className="flex items-center flex-1">
                    <span onClick={() => window.location.href = "/"} className="flex items-center space-x-2 cursor-pointer">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="hidden font-bold text-lg sm:inline-block">
                            Gestor de Eventos
                        </span>
                    </span>
                </div>

                <nav className="hidden md:flex items-center justify-center space-x-6 text-sm font-medium">
                    {links.map((link) => (
                        <span
                            key={link.href}
                            onClick={() => window.location.href = link.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80 flex items-center gap-2 cursor-pointer",
                                pathname === link.href ? "text-primary font-semibold" : "text-foreground/60"
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </span>
                    ))}
                    {session?.user?.role === "ADMIN" && (
                        <span
                            onClick={() => window.location.href = "/admin/logs"}
                            className={cn(
                                "transition-colors hover:text-foreground/80 flex items-center gap-2 cursor-pointer",
                                pathname === "/admin/logs" ? "text-primary font-semibold" : "text-foreground/60"
                            )}
                        >
                            <ScrollText className="h-4 w-4" />
                            Logs
                        </span>
                    )}
                </nav>

                <div className="flex items-center justify-end gap-4 flex-1">
                    {queueSize > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={sync}
                            disabled={!isOnline || isSyncing}
                            className="gap-2"
                        >
                            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                            Sincronizar ({queueSize})
                        </Button>
                    )}
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="" alt="@user" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {session.user?.email?.[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name || "Usuário"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <span onClick={() => window.location.href = "/profile"} className="cursor-pointer flex items-center">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Perfil</span>
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                                <span onClick={() => window.location.href = "/login"} className="cursor-pointer">Entrar</span>
                            </Button>
                            <Button asChild size="sm">
                                <span onClick={() => window.location.href = "/register"} className="cursor-pointer">Cadastrar</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
