import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req })
    const path = req.nextUrl.pathname

    // Define Public Routes
    const isPublic =
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path.startsWith("/events/") ||
        path.startsWith("/verify-certificate");

    // 1. Redirect to Dashboard if logged in and trying to access auth pages
    if (token && (path === "/login" || path === "/register")) {
        const response = NextResponse.redirect(new URL("/", req.url));
        return response;
    }

    // 2. Protect Private Routes
    if (!isPublic && !token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Admin route protection
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
