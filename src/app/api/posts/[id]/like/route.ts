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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      logger.info('Like removed', { userId: session.user.id, postId });
      return NextResponse.json({ message: "Like removed" });
    } else {
      const newLike = await prisma.like.create({
        data: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      });
      logger.info('Post liked', { userId: session.user.id, postId });
      return NextResponse.json(newLike, { status: 201 });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in toggling like', { error });
    throw new InternalServerError();
  }
}