import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const postId = parseInt(params.id);

    const post = await prisma.birdPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const existingDislike = await prisma.dislike.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      },
    });

    if (existingDislike) {
      await prisma.dislike.delete({
        where: { id: existingDislike.id },
      });
      logger.info('Dislike removed', { userId: session.user.id, postId });
      return NextResponse.json({ message: "Dislike removed" });
    } else {
      const newDislike = await prisma.dislike.create({
        data: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      });
      logger.info('Post disliked', { userId: session.user.id, postId });
      return NextResponse.json(newDislike, { status: 201 });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in toggling dislike', { error });
    throw new InternalServerError();
  }
}