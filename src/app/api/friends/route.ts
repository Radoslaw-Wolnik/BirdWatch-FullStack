// File: src/pages/api/friends/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, NotFoundError, ConflictError } from '@/lib/errors';
import { SafeFriendship, FriendshipStatus } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  switch (req.method) {
    case 'POST':
      return handleSendFriendRequest(req, res, session.user.id);
    case 'GET':
      return handleGetFriendships(req, res, session.user.id);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleSendFriendRequest(req: NextApiRequest, res: NextApiResponse, currentUserId: number) {
  try {
    const { friendId } = req.body;
    
    if (!friendId || typeof friendId !== 'number') {
      throw new BadRequestError('Invalid friend ID');
    }

    if (friendId === currentUserId) {
      throw new BadRequestError('You cannot send a friend request to yourself');
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ConflictError('Friendship or request already exists');
    }

    const newFriendship = await prisma.friendship.create({
      data: {
        userId: currentUserId,
        friendId: friendId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        friend: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    res.status(201).json(newFriendship as SafeFriendship);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ConflictError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetFriendships(req: NextApiRequest, res: NextApiResponse, currentUserId: number) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId },
          { friendId: currentUserId },
        ],
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        friend: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    res.status(200).json(friendships as SafeFriendship[]);
  } catch (error) {
    console.error('Get friendships error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}