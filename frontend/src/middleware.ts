import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // If the user is logged in and trying to access login/register, redirect to dashboard
        if (
            (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") &&
            req.nextauth.token
        ) {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // Admin route protection
        if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const pathname = req.nextUrl.pathname

                // Public routes
                if (
                    pathname === "/" ||
                    pathname === "/login" ||
                    pathname === "/register" ||
                    pathname.startsWith("/events/")
                ) {
                    return true
                }

                // Protected routes require token
                return !!token
            },
        },
    }
)

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
