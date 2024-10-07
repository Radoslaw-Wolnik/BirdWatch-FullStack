import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, BadRequestError, ForbiddenError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { description, qualifications, location } = await req.json();

    if (!description || !qualifications || !location) {
      throw new BadRequestError("Missing required fields");
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        posts: true,
        friends: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.posts.length < 10 || user.friends.length < 5) {
      throw new ForbiddenError("User does not meet requirements for moderator");
    }

    const moderatorRequest = await prisma.moderatorRequest.create({
      data: {
        userId: user.id,
        description,
        qualifications,
        location,
      },
    });

    logger.info('Moderator request submitted', { userId: user.id });
    return NextResponse.json(moderatorRequest, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in creating moderator request', { error });
    throw new InternalServerError();
  }
}