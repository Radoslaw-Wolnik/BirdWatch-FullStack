// File: src/pages/api/admin/analytics.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  if (session.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('You do not have permission to access this resource');
    // File: src/pages/api/admin/analytics.ts (continued)

  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const analytics = await getAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getAnalytics() {
  const userCount = await prisma.user.count();
  const postCount = await prisma.birdPost.count();

  const newUsersLastWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });

  const newPostsLastWeek = await prisma.birdPost.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });

  const topBirds = await prisma.bird.findMany({
    take: 5,
    orderBy: {
      birdPosts: {
        _count: 'desc'
      }
    },
    include: {
      _count: {
        select: { birdPosts: true }
      }
    }
  });

  const topPosters = await prisma.user.findMany({
    take: 5,
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      username: true,
      _count: {
        select: { posts: true }
      }
    }
  });

  const flaggedPostsCount = await prisma.flaggedPost.count({
    where: {
      status: 'PENDING'
    }
  });

  return {
    userStats: {
      totalUsers: userCount,
      newUsersLastWeek
    },
    postStats: {
      totalPosts: postCount,
      newPostsLastWeek
    },
    topBirds: topBirds.map(bird => ({
      id: bird.id,
      name: bird.name,
      species: bird.species,
      postCount: bird._count.birdPosts
    })),
    topPosters: topPosters.map(user => ({
      id: user.id,
      username: user.username,
      postCount: user._count.posts
    })),
    moderationStats: {
      pendingFlaggedPosts: flaggedPostsCount
    }
  };
}