import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
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

    logger.info('User profile fetched', { profileId: userId });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching user profile', { error });
    throw new InternalServerError();
  }
}