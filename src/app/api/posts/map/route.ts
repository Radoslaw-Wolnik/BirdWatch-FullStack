import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BadRequestError, InternalServerError, AppError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const birdSpecies = searchParams.getAll('species');

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      throw new BadRequestError("Invalid query parameters");
    }

    let whereClause = '';
    if (birdSpecies.length > 0) {
      const speciesConditions = birdSpecies.map(species => `'${species}' = ANY(bird_species)`);
      whereClause = `AND (${speciesConditions.join(' OR ')})`;
    }

    const posts = await prisma.$queryRaw`
      SELECT id, latitude, longitude, bird_species
      FROM "BirdPost"
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lon})) <= ${radius * 1000}
      ${Prisma.raw(whereClause)}
    `;

    logger.info('Map view posts fetched', { lat, lon, radius, birdSpecies });
    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in fetching map view posts', { error });
    throw new InternalServerError();
  }
}