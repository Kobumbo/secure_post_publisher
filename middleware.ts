import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const sessionId = req.cookies.get('session_id')?.value;
    const { pathname } = req.nextUrl;

    // Exclude API routes and static files
    if (pathname.startsWith('/api/') || pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    // No session handling
    if (!sessionId) {
        if (['/signin', '/signup'].includes(pathname)) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    // Validate session
    let response;
    try {
        response = await fetch(`${req.nextUrl.origin}/api/auth/validate-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
    } catch  {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    // Handle invalid session
    if (response.status === 401) {
        if (['/signin', '/signup'].includes(pathname)) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    if (!response.ok) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    const data = await response.json();
    const session = data.session;
    const user = data.user;

    if (!session || !user) {
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    // 2FA not set up
    if (!user.is2FAEnabled) {
        if (pathname === '/setup-2fa') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/setup-2fa', req.url));
    }

    // 2FA set up but not verified
    if (user.is2FAEnabled && !session.is2FAVerified) {
        if (pathname === '/verify-2fa') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/verify-2fa', req.url));
    }

    // 2FA verified
    if (user.is2FAEnabled && session.is2FAVerified) {
        if (['/signin', '/signup', '/verify-2fa', '/setup-2fa'].includes(pathname)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        if (!isValidPath(pathname)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/signin', req.url));
}

function isValidPath(path: string): boolean {
    const validPaths = ['/', '/change-password']; // Add authorized paths
    return validPaths.includes(path);
}

export const config = {
    matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};