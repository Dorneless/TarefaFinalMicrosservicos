import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Redirect to Dashboard if logged in and trying to access auth pages
        if (
            (path === "/login" || path === "/register") &&
            token
        ) {
            const response = NextResponse.redirect(new URL("/", req.url));
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        }

        // 2. Define Public Routes
        const isPublic =
            path === "/" ||
            path === "/login" ||
            path === "/register" ||
            path.startsWith("/events/") ||
            path.startsWith("/verify-certificate");

        // 3. Protect Private Routes (Manual Redirect for Cache Control)
        if (!isPublic && !token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.url);
            const response = NextResponse.redirect(loginUrl);
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        }

        // 4. Admin route protection
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            const response = NextResponse.redirect(new URL("/", req.url));
            response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");
            return response;
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // authorized: Always return true to delegate logic to the middleware function above
            // This prevents the implicit (and cached) redirect from withAuth
            authorized: () => true,
        },
    }
)

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
