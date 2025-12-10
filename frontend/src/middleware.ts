import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const path = req.nextUrl.pathname;

    // Define public routes
    const isPublicRoute =
        path === '/login' ||
        path === '/register' ||
        path.startsWith('/verify-certificate') ||
        path.startsWith('/api/');

    // Allow public routes
    if (isPublicRoute) {
        // Redirect authenticated users away from auth pages
        if (token && (path === '/login' || path === '/register')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    // Protect private routes - redirect to login if not authenticated
    if (!token) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
