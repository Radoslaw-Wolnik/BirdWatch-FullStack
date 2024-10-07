import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, BadRequestError, NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const postId = parseInt(params.id);
    const { reason } = await req.json();

    if (!reason) {
      throw new BadRequestError("Reason is required");
    }

    const post = await prisma.birdPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const flaggedPost = await prisma.flaggedPost.create({
      data: {
        postId: postId,
        userId: parseInt(session.user.id),
        reason: reason,
      },
    });

    logger.info('Post flagged', { userId: session.user.id, postId, reason });
    return NextResponse.json(flaggedPost, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in flagging post', { error });
    throw new InternalServerError();
  }
}