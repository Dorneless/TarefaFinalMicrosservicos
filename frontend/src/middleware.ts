import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        console.log(`[Middleware] Path: ${path}, Token Exists: ${!!token}, Role: ${token?.role}`);

        // If the user is logged in and trying to access login/register, redirect to dashboard
        if (
            (path === "/login" || path === "/register") &&
            token
        ) {
            console.log(`[Middleware] Redirecting logged in user from ${path} to /`);
            const response = NextResponse.redirect(new URL("/", req.url));
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        }

        // Admin route protection
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            console.log(`[Middleware] Redirecting unauthorized user from ${path} to /`);
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
                const isAuth = !!token;

                // Simple log to trace every request decision
                console.log(`[Middleware:Authorized] Path: ${pathname}, Token: ${isAuth ? 'YES' : 'NO'}`);

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
                if (!isAuth) {
                    console.log(`[Middleware:Authorized] Access Denied for ${pathname}. Redirecting to Login.`);
                }
                return isAuth
            },
        },
    }
)

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
