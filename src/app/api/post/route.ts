import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { birdSpecies, description, latitude, longitude, photos } = await req.json();

  try {
    const post = await prisma.birdPost.create({
      data: {
        userId: parseInt(session.user.id),
        birdSpecies,
        description,
        latitude,
        longitude,
        photos,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Error creating post" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const radius = parseInt(searchParams.get('radius') || '100');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const posts = await prisma.$queryRaw`
      SELECT * FROM "BirdPost"
      WHERE earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${lat}, ${lon})) <= ${radius * 1000}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Error fetching posts" }, { status: 500 });
  }
}