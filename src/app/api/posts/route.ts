// File: src/pages/api/posts/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { createPostSchema } from '@/lib/validationSchemas';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import { SafeBirdPost, PaginationParams, SortParams } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  switch (req.method) {
    case 'POST':
      return handleCreatePost(req, res, session.user.id);
    case 'GET':
      return handleGetPosts(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreatePost(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
    const validatedData = createPostSchema.parse(req.body);

    const newPost = await prisma.birdPost.create({
      data: {
        ...validatedData,
        userId,
        birdId: (await prisma.bird.findFirstOrThrow({ where: { species: validatedData.birdSpecies } })).id,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        bird: true,
      },
    });

    res.status(201).json(newPost as SafeBirdPost);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetPosts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '10', sortBy = 'createdAt', order = 'desc' } = req.query;

    const paginationParams: PaginationParams = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const sortParams: SortParams = {
      field: sortBy as string,
      order: order as 'asc' | 'desc',
    };

    const posts = await prisma.birdPost.findMany({
      skip: (paginationParams.page - 1) * paginationParams.limit,
      take: paginationParams.limit,
      orderBy: { [sortParams.field]: sortParams.order },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        bird: true,
      },
    });

    const totalPosts = await prisma.birdPost.count();

    res.status(200).json({
      posts: posts as SafeBirdPost[],
      totalPages: Math.ceil(totalPosts / paginationParams.limit),
      currentPage: paginationParams.page,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}