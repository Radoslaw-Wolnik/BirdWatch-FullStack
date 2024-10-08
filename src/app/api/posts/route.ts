import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { UnauthorizedError, BadRequestError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { birdSpecies, description, latitude, longitude, photos, customDate } = await req.json();

    if (!birdSpecies || !description || latitude === undefined || longitude === undefined) {
      throw new BadRequestError("Missing required fields");
    }

    // Validate customDate is not more than one month in the past
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const postDate = customDate ? new Date(customDate) : new Date();
    
    if (postDate < oneMonthAgo) {
      throw new BadRequestError("Custom date cannot be more than one month in the past");
    }

    const post = await prisma.birdPost.create({
      data: {
        userId: parseInt(session.user.id),
        birdSpecies: Array.isArray(birdSpecies) ? birdSpecies : [birdSpecies],
        description,
        latitude,
        longitude,
        photos,
        createdAt: postDate,
      },
    });

    logger.info('New bird post created', { userId: session.user.id, postId: post.id });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in creating post', { error });
    throw new InternalServerError();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const radius = parseInt(searchParams.get('radius') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const birdSpecies = searchParams.get('species');

    if (isNaN(lat) || isNaN(lon) || isNaN(radius) || isNaN(page) || isNaN(limit)) {
      throw new BadRequestError("Invalid query parameters");
    }

    const whereClause = birdSpecies
      ? `AND '${birdSpecies}' = ANY(bird_species)`
      : '';

    const posts = await prisma.$queryRaw`
      SELECT * FROM "BirdPost"
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lon})) <= ${radius * 1000}
      ${prisma.Prisma.raw(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    logger.info('Bird posts fetched', { lat, lon, radius, page, limit, birdSpecies });
    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching posts', { error });
    throw new InternalServerError();
  }
}