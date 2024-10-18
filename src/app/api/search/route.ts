// File: src/pages/api/search/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import { SafeBird, SafeBirdPost, PaginationParams } from '@/types/global';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['birds', 'posts']),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { query, type, page, limit } = searchSchema.parse(req.query);

    const paginationParams: PaginationParams = { page, limit };

    let results;
    let total;

    if (type === 'birds') {
      [results, total] = await searchBirds(query, paginationParams);
    } else {
      [results, total] = await searchPosts(query, paginationParams);
    }

    res.status(200).json({
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid search parameters', errors: error.errors });
    }
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function searchBirds(query: string, { page, limit }: PaginationParams): Promise<[SafeBird[], number]> {
  const birds = await prisma.bird.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { species: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { 
      icon: {
        include: {
          uploadedBy: {
            select: { id: true, username: true, profilePicture: true, role: true }
          },
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  const safeBirds: SafeBird[] = birds.map(bird => ({
    id: bird.id,
    name: bird.name,
    species: bird.species,
    description: bird.description,
    icon: bird.icon ? {
      id: bird.icon.id,
      birdId: bird.icon.birdId, // its so stupid to have this here but for now im okay with it -- fix in future global types
      url: bird.icon.url,
      verified: bird.icon.verified,
      uploadedBy: {
        id: bird.icon.uploadedBy.id,
        username: bird.icon.uploadedBy.username,
        profilePicture: bird.icon.uploadedBy.profilePicture,
        role: bird.icon.uploadedBy.role
      }
    } : undefined
  }));
  
  const total = await prisma.bird.count({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { species: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
  
  return [safeBirds, total];
}

async function searchPosts(query: string, { page, limit }: PaginationParams): Promise<[SafeBirdPost[], number]> {
  const posts = await prisma.birdPost.findMany({
    where: {
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { bird: { name: { contains: query, mode: 'insensitive' } } },
        { bird: { species: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      user: {
        select: { id: true, username: true, profilePicture: true, role: true }
      },
      bird: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.birdPost.count({
    where: {
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { bird: { name: { contains: query, mode: 'insensitive' } } },
        { bird: { species: { contains: query, mode: 'insensitive' } } },
      ],
    },
  });

  return [posts as SafeBirdPost[], total];
}