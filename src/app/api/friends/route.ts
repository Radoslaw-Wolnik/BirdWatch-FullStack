import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, BadRequestError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { friendId } = await req.json();

    if (!friendId) {
      throw new BadRequestError("Friend ID is required");
    }

    const friendship = await prisma.friendship.create({
      data: {
        userId: parseInt(session.user.id),
        friendId: friendId,
        status: 'PENDING',
      },
    });

    logger.info('Friend request sent', { userId: session.user.id, friendId });
    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in friend request', { error });
    throw new InternalServerError();
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: parseInt(session.user.id), status: 'ACCEPTED' },
          { friendId: parseInt(session.user.id), status: 'ACCEPTED' },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return NextResponse.json(friends);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching friends', { error });
    throw new InternalServerError();
  }
}