// File: src/pages/api/friendships/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { SafeFriendship, FriendshipStatus } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  const { id } = req.query;
  const friendshipId = parseInt(id as string, 10);

  switch (req.method) {
    case 'PUT':
      return handleUpdateFriendship(req, res, friendshipId, session.user.id);
    case 'DELETE':
      return handleDeleteFriendship(req, res, friendshipId, session.user.id);
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleUpdateFriendship(req: NextApiRequest, res: NextApiResponse, friendshipId: number, currentUserId: number) {
  try {
    const { action } = req.body;

    if (!action || (action !== 'accept' && action !== 'decline')) {
      throw new BadRequestError('Invalid action');
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        friend: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    if (!friendship) {
      throw new NotFoundError('Friendship not found');
    }

    if (friendship.friendId !== currentUserId) {
      throw new ForbiddenError('You are not authorized to perform this action');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestError('This friendship request has already been processed');
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED,
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

    res.status(200).json(updatedFriendship as SafeFriendship);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Update friendship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDeleteFriendship(req: NextApiRequest, res: NextApiResponse, friendshipId: number, currentUserId: number) {
  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundError('Friendship not found');
    }

    if (friendship.userId !== currentUserId && friendship.friendId !== currentUserId) {
      throw new ForbiddenError('You are not authorized to delete this friendship');
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    res.status(204).end();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Delete friendship error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}