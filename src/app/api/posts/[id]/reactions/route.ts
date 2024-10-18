// File: src/pages/api/posts/[id]/reactions/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, NotFoundError } from '@/lib/errors';
import { SafeLike, SafeDislike } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  const { id } = req.query;
  const postId = parseInt(id as string, 10);

  switch (req.method) {
    case 'POST':
      return handleAddReaction(req, res, postId, session.user.id);
    case 'DELETE':
      return handleRemoveReaction(req, res, postId, session.user.id);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleAddReaction(req: NextApiRequest, res: NextApiResponse, postId: number, userId: number) {
  try {
    const { type } = req.body;

    if (type !== 'like' && type !== 'dislike') {
      throw new BadRequestError('Invalid reaction type');
    }

    const post = await prisma.birdPost.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    const existingDislike = await prisma.dislike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (type === 'like' && existingLike) {
      throw new BadRequestError('You have already liked this post');
    }

    if (type === 'dislike' && existingDislike) {
      throw new BadRequestError('You have already disliked this post');
    }

    if (type === 'like' && existingDislike) {
      await prisma.dislike.delete({ where: { userId_postId: { userId, postId } } });
    }

    if (type === 'dislike' && existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    }

    let reaction;

    if (type === 'like') {
      reaction = await prisma.like.create({
        data: { userId, postId },
        include: { user: { select: { id: true, username: true, profilePicture: true, role: true } } },
      });
    } else {
      reaction = await prisma.dislike.create({
        data: { userId, postId },
        include: { user: { select: { id: true, username: true, profilePicture: true, role: true } } },
      });
    }

    res.status(201).json(reaction as SafeLike | SafeDislike);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleRemoveReaction(req: NextApiRequest, res: NextApiResponse, postId: number, userId: number) {
  try {
    const { type } = req.body;

    if (type !== 'like' && type !== 'dislike') {
      throw new BadRequestError('Invalid reaction type');
    }

    if (type === 'like') {
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (!like) {
        throw new NotFoundError('Like not found');
      }

      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    } else {
      const dislike = await prisma.dislike.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (!dislike) {
        throw new NotFoundError('Dislike not found');
      }

      await prisma.dislike.delete({ where: { userId_postId: { userId, postId } } });
    }

    res.status(204).end();
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}