import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export default auth(async (req) => {
  const session = req.auth;

  // Check if user is trying to access admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // If not authenticated, redirect to login
    if (!session) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return Response.redirect(loginUrl);
    }

    try {
      // Fetch user with role information
      const user = await prisma.user.findUnique({
        where: { id: session.user?.id },
        include: {
          role: true, // Include the role relation
        },
      });

      // Check if user exists and has admin role
      if (!user || user.role?.name !== 'Admin') {
        // Redirect unauthorized users to unauthorized page
        return Response.redirect(new URL('/admin/unauthorized', req.nextUrl.origin));
      }
    } catch (error) {
      console.error('Error verifying admin access:', error);
      // In case of error, redirect to unauthorized page
      return Response.redirect(new URL('/admin/unauthorized', req.nextUrl.origin));
    }
  }

  // Redirect from login page if user is already authenticated
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
