// File: src/pages/api/posts/[id]/flag/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, NotFoundError } from '@/lib/errors';
import { SafeFlaggedPost, UserRole } from '@/types/global';
import { z } from 'zod';

const flagPostSchema = z.object({
  reason: z.string().min(1).max(500),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  const { id } = req.query;
  const postId = parseInt(id as string, 10);

  switch (req.method) {
    case 'POST':
      return handleFlagPost(req, res, postId, session.user.id);
    case 'GET':
      return handleGetFlaggedPosts(req, res, session.user.role);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleFlagPost(req: NextApiRequest, res: NextApiResponse, postId: number, userId: number) {
  try {
    const { reason } = flagPostSchema.parse(req.body);

    const post = await prisma.birdPost.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingFlag = await prisma.flaggedPost.findFirst({
      where: { postId, userId },
    });

    if (existingFlag) {
      throw new BadRequestError('You have already flagged this post');
    }

    const flaggedPost = await prisma.flaggedPost.create({
      data: {
        postId,
        userId,
        reason,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        post: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true, role: true }
            },
            bird: true,
          },
        },
      },
    });

    res.status(201).json(flaggedPost as SafeFlaggedPost);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Flag post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetFlaggedPosts(req: NextApiRequest, res: NextApiResponse, userRole: UserRole) {
  try {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
      throw new UnauthorizedError('You are not authorized to view flagged posts');
    }

    const flaggedPosts = await prisma.flaggedPost.findMany({
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        post: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true, role: true }
            },
            bird: true,
          },
        },
      },
    });

    res.status(200).json(flaggedPosts as SafeFlaggedPost[]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Get flagged posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}