import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, InternalServerError, AppError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const userFriends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: 'ACCEPTED' },
          { friendId: session.user.id, status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = userFriends.map(friendship => 
      friendship.userId === session.user.id ? friendship.friendId : friendship.userId
    );

    const feedPosts = await prisma.birdPost.findMany({
      where: {
        userId: {
          in: friendIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        likes: true,
        dislikes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    logger.info('Feed posts fetched', { userId: session.user.id, page, limit });
    return NextResponse.json(feedPosts);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching feed posts', { error });
    throw new InternalServerError();
  }
}