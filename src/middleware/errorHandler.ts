// middleware/errorHandler.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AppError } from '../lib/errors';
import logger from '../lib/logger';

export function errorHandler(error: unknown, req: NextRequest) {
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
  } else {
    logger.error('Unknown error', { error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}