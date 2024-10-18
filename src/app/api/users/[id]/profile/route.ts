// File: src/pages/api/users/[id]/profile.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { SafeUser, PublicUser } from '@/types/global';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  profilePicture: z.string().url().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  const { id } = req.query;
  const userId = parseInt(id as string, 10);

  switch (req.method) {
    case 'GET':
      return handleGetProfile(req, res, userId);
    case 'PUT':
      return handleUpdateProfile(req, res, userId, session.user.id);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetProfile(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json(user as PublicUser);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleUpdateProfile(req: NextApiRequest, res: NextApiResponse, profileId: number, currentUserId: number) {
  try {
    if (profileId !== currentUserId) {
      throw new ForbiddenError('You are not authorized to update this profile');
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: profileId },
      data: validatedData,
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        role: true,
        createdAt: true,
        lastActive: true,
      },
    });

    res.status(200).json(updatedUser as SafeUser);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ForbiddenError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}