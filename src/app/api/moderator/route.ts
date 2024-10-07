import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, ForbiddenError, BadRequestError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'MODERATOR') {
      throw new ForbiddenError("Only moderators can access this route");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const flaggedPosts = await prisma.flaggedPost.findMany({
      where: { status: 'PENDING' },
      include: { post: true, user: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    logger.info('Moderator fetched flagged posts', { moderatorId: session.user.id, page, limit });
    return NextResponse.json(flaggedPosts);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching flagged posts', { error });
    throw new InternalServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'MODERATOR') {
      throw new ForbiddenError("Only moderators can access this route");
    }

    const { flaggedPostId, action } = await req.json();

    if (!flaggedPostId || !action) {
      throw new BadRequestError("Flagged post ID and action are required");
    }

    if (action !== 'RESOLVE' && action !== 'DISMISS') {
      throw new BadRequestError("Invalid action. Must be either 'RESOLVE' or 'DISMISS'");
    }

    const updatedFlaggedPost = await prisma.flaggedPost.update({
      where: { id: flaggedPostId },
      data: { status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' },
    });

    if (action === 'RESOLVE') {
      await prisma.birdPost.delete({
        where: { id: updatedFlaggedPost.postId },
      });
      logger.info('Moderator resolved and deleted flagged post', { moderatorId: session.user.id, flaggedPostId, postId: updatedFlaggedPost.postId });
    } else {
      logger.info('Moderator dismissed flagged post', { moderatorId: session.user.id, flaggedPostId });
    }

    return NextResponse.json(updatedFlaggedPost);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in updating flagged post', { error });
    throw new InternalServerError();
  }
}