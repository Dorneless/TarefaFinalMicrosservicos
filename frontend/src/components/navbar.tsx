"use client";

import Link from "next/link";
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
import { User, LogOut, Calendar, Award, UserCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Events", icon: Calendar },
        { href: "/my-registrations", label: "Registrations", icon: User },
        { href: "/my-certificates", label: "Certificates", icon: Award },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="hidden font-bold text-lg sm:inline-block">
                            Event Manager
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80 flex items-center gap-2",
                                    pathname === link.href ? "text-primary font-semibold" : "text-foreground/60"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                        {session?.user?.role === "ADMIN" && (
                            <Link
                                href="/admin/events/create"
                                className={cn(
                                    "transition-colors hover:text-foreground/80 font-semibold text-primary flex items-center gap-2",
                                    pathname === "/admin/events/create" ? "text-primary/80" : "text-primary"
                                )}
                            >
                                Create Event
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="/avatars/01.png" alt="@user" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {session.user?.email?.[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
