import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      throw new BadRequestError("Missing required fields");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    logger.info('New user registered', { userId: newUser.id });
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in user registration', { error });
    throw new InternalServerError();
  }
}