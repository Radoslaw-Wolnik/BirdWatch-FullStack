import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, ForbiddenError, BadRequestError, InternalServerError, AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { calculateDistanceInKm } from '@/lib/geoUtils';
import { Coordinates } from '@/types';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'MODERATOR') {
      throw new ForbiddenError("Only moderators can access this route");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');

    const moderator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, moderatorRequests: { select: { location: true } } }
    });

    if (!moderator || !moderator.moderatorRequests[0]) {
      throw new BadRequestError("Moderator location not found");
    }

    const [moderatorLat, moderatorLon] = moderator.moderatorRequests[0].location.split(',').map(Number);

    const flaggedPosts = await prisma.flaggedPost.findMany({
      where: { status: 'PENDING' },
      include: { post: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    const moderatorCoords: Coordinates = {
      latitude: moderatorLat,
      longitude: moderatorLon
    };

    const filteredPosts = flaggedPosts.filter(flaggedPost => {
      const postCoords: Coordinates = {
        latitude: flaggedPost.post.latitude,
        longitude: flaggedPost.post.longitude
      };
    
      const distance = calculateDistanceInKm(moderatorCoords, postCoords);
      return distance <= 1000; // 1000 km radius
    });

    const paginatedPosts = filteredPosts.slice((page - 1) * limit, page * limit);

    logger.info('Moderator fetched flagged posts', { moderatorId: session.user.id, page, limit });
    return NextResponse.json(paginatedPosts);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching flagged posts', { error });
    throw new InternalServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    if (session.user.role !== 'MODERATOR') {
      throw new ForbiddenError("Only moderators can access this route");
    }

    const { flaggedPostId, action } = await req.json();

    if (!flaggedPostId || !action) {
      throw new BadRequestError("Flagged post ID and action are required");
    }

    if (action !== 'RESOLVE' && action !== 'DISMISS') {
      throw new BadRequestError("Invalid action. Must be either 'RESOLVE' or 'DISMISS'");
    }

    const updatedFlaggedPost = await prisma.flaggedPost.update({
      where: { id: flaggedPostId },
      data: { status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' },
    });

    if (action === 'RESOLVE') {
      await prisma.birdPost.delete({
        where: { id: updatedFlaggedPost.postId },
      });
      logger.info('Moderator resolved and deleted flagged post', { moderatorId: session.user.id, flaggedPostId, postId: updatedFlaggedPost.postId });
    } else {
      logger.info('Moderator dismissed flagged post', { moderatorId: session.user.id, flaggedPostId });
    }

    return NextResponse.json(updatedFlaggedPost);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in updating flagged post', { error });
    throw new InternalServerError();
  }
}