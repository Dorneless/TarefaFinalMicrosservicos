import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // If the user is logged in and trying to access login/register, redirect to dashboard
        if (
            (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") &&
            req.nextauth.token
        ) {
            const response = NextResponse.redirect(new URL("/", req.url));
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        }

        // Admin route protection
        if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
            const response = NextResponse.redirect(new URL("/", req.url));
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
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
                    pathname.startsWith("/events/") ||
                    pathname.startsWith("/verify-certificate")
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
