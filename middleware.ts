import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === '/login';
  const isOnAuthApi = req.nextUrl.pathname.startsWith('/api/auth');
  const isOnTrpcApi = req.nextUrl.pathname.startsWith('/api/trpc');

  // Allow auth API routes
  if (isOnAuthApi) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow login page for non-authenticated users
  if (isOnLoginPage) {
    return NextResponse.next();
  }

  // Protect tRPC API routes - return 401 if not authenticated
  if (isOnTrpcApi && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect non-authenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
