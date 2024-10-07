// middleware/index.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { errorHandler } from './errorHandler';
import { rateLimiterMiddleware } from './rateLimiter';
import { authMiddleware } from './authMiddleware';

export async function middleware(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimiterResult = await rateLimiterMiddleware(req);
    if (rateLimiterResult) return rateLimiterResult;

    // Apply authentication for protected routes
    if (req.nextUrl.pathname.startsWith('/api/protected')) {
      const authResult = await authMiddleware(req);
      if (authResult) return authResult;
    }

    // Continue to the next middleware or route handler
    return NextResponse.next();
  } catch (error) {
    return errorHandler(error, req);
  }
}

export const config = {
  matcher: '/api/:path*',
};