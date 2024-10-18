// File: src/pages/api/moderator-requests/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { SafeModeratorRequest, UserRole } from '@/types/global';
import { moderatorRequestSchema } from '@/lib/validationSchemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  switch (req.method) {
    case 'POST':
      return handleCreateModeratorRequest(req, res, session.user.id);
    case 'GET':
      return handleGetModeratorRequests(req, res, session.user.role);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreateModeratorRequest(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
    const validatedData = moderatorRequestSchema.parse(req.body);

    const existingRequest = await prisma.moderatorRequest.findFirst({
      where: { userId: userId },
    });

    if (existingRequest) {
      throw new BadRequestError('You have already submitted a moderator request');
    }

    const newRequest = await prisma.moderatorRequest.create({
      data: {
        ...validatedData,
        userId: userId,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    res.status(201).json(newRequest as SafeModeratorRequest);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Create moderator request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetModeratorRequests(req: NextApiRequest, res: NextApiResponse, userRole: UserRole) {
  try {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('You are not authorized to view moderator requests');
    }

    const requests = await prisma.moderatorRequest.findMany({
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    res.status(200).json(requests as SafeModeratorRequest[]);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Get moderator requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}