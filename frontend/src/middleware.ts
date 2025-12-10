import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
    const isOnLogin = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

    // Root is now public events page, so no protection needed for "/"
    // Only protect /dashboard if we still use it for other things, or protect specific admin routes.
    // User said "events listing doesn't need to be protected".
    // User said "dashboard... put events on root".

    // If we have other protected pages, we should protect them.
    // For now, let's just protect /dashboard if it still exists (it doesn't, we deleted it).
    // But wait, are there other pages?
    // User mentioned "demais páginas que terão layout igual".
    // If we have profile or admin pages, they might be in (main).
    // Let's assume for now only (auth) pages are for guests-only (redirect to / if logged in?)
    // And root is public.

    if (isOnLogin) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
        return
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
