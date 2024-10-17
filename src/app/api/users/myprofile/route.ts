import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        createdAt: true,
        role: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            likes: true,
            dislikes: true,
          },
        },
        _count: {
          select: {
            posts: true,
            friends: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    logger.info('User fetched own profile', { userId: session.user.id });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching user profile', { error });
    throw new InternalServerError();
  }
}