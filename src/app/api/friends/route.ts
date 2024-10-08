import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, BadRequestError, NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { friendshipId, action } = await req.json();

    if (!friendshipId || !action) {
      throw new BadRequestError("Friendship ID and action are required");
    }

    if (action !== 'ACCEPT' && action !== 'DECLINE') {
      throw new BadRequestError("Invalid action. Must be either 'ACCEPT' or 'DECLINE'");
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.friendId !== parseInt(session.user.id)) {
      throw new NotFoundError("Friendship request not found");
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' },
    });

    logger.info(`Friend request ${action.toLowerCase()}ed`, { userId: session.user.id, friendshipId });
    return NextResponse.json(updatedFriendship);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in updating friendship', { error });
    throw new InternalServerError();
  }
}