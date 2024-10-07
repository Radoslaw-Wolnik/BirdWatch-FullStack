import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AppError } from '../lib/errors';
import logger from '../lib/logger';

export function middleware(request: NextRequest) {
  try {
    // Your existing middleware logic here
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`AppError: ${error.message}`, { statusCode: error.statusCode, stack: error.stack });
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    } else if (error instanceof Error) {
      logger.error(`Unhandled Error: ${error.message}`, { stack: error.stack });
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
}

export const config = {
  matcher: '/api/:path*',
};

import { rateLimiter } from './lib/rateLimiter';

export async function middleware(request: NextRequest) {
  try {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429 }
      );
    }

    // Your existing middleware logic here
  } catch (error) {
    // Error handling logic
  }
}