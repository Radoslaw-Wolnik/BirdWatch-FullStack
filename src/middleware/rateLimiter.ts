// middleware/rateLimiter.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from '../lib/rateLimiter';

export async function rateLimiterMiddleware(req: NextRequest) {
  try {
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}