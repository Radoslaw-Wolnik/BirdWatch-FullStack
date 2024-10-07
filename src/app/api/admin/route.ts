import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, ForbiddenError, NotFoundError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'ADMIN') {
      throw new ForbiddenError("Only admins can access this route");
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'inactiveUsers':
        return getInactiveUsers();
      case 'moderatorRequests':
        return getModeratorRequests();
      case 'flaggedPosts':
        return getFlaggedPosts();
      default:
        throw new BadRequestError("Invalid action");
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in admin GET route', { error });
    throw new InternalServerError();
  }
}

async function getInactiveUsers() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastActive: {
          lt: thirtyDaysAgo
        }
      }
    });
    return NextResponse.json(inactiveUsers);
  } catch (error) {
    logger.error("Error fetching inactive users:", error);
    throw new InternalServerError("Error fetching inactive users");
  }
}

async function getModeratorRequests() {
  try {
    const moderatorRequests = await prisma.moderatorRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: true }
    });
    return NextResponse.json(moderatorRequests);
  } catch (error) {
    logger.error("Error fetching moderator requests:", error);
    throw new InternalServerError("Error fetching moderator requests");
  }
}

async function getFlaggedPosts() {
  try {
    const flaggedPosts = await prisma.flaggedPost.findMany({
      where: { status: 'PENDING' },
      include: { post: true, user: true }
    });
    return NextResponse.json(flaggedPosts);
  } catch (error) {
    logger.error("Error fetching flagged posts:", error);
    throw new InternalServerError("Error fetching flagged posts");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'ADMIN') {
      throw new ForbiddenError("Only admins can access this route");
    }

    const { action, id } = await req.json();

    switch (action) {
      case 'deleteUser':
        return deleteUser(id);
      case 'approveModerator':
        return approveModerator(id);
      case 'deletePost':
        return deletePost(id);
      default:
        throw new BadRequestError("Invalid action");
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in admin POST route', { error });
    throw new InternalServerError();
  }
}

async function deleteUser(userId: number) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", error);
    throw new InternalServerError("Error deleting user");
  }
}

async function approveModerator(requestId: number) {
  try {
    const request = await prisma.moderatorRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
      include: { user: true },
    });

    await prisma.user.update({
      where: { id: request.user.id },
      data: { role: 'MODERATOR' },
    });

    return NextResponse.json({ message: "Moderator approved successfully" });
  } catch (error) {
    logger.error("Error approving moderator:", error);
    throw new InternalServerError("Error approving moderator");
  }
}

async function deletePost(postId: number) {
  try {
    await prisma.birdPost.delete({ where: { id: postId } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.error("Error deleting post:", error);
    throw new InternalServerError("Error deleting post");
  }
}