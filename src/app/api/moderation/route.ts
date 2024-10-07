import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MODERATOR') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const flaggedPosts = await prisma.flaggedPost.findMany({
      where: { status: 'PENDING' },
      include: { post: true, user: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(flaggedPosts);
  } catch (error) {
    console.error("Error fetching flagged posts:", error);
    return NextResponse.json({ error: "Error fetching flagged posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MODERATOR') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flaggedPostId, action } = await req.json();

  try {
    const updatedFlaggedPost = await prisma.flaggedPost.update({
      where: { id: flaggedPostId },
      data: { status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' },
    });

    if (action === 'RESOLVE') {
      await prisma.birdPost.delete({
        where: { id: updatedFlaggedPost.postId },
      });
    }

    return NextResponse.json(updatedFlaggedPost);
  } catch (error) {
    console.error("Error updating flagged post:", error);
    return NextResponse.json({ error: "Error updating flagged post" }, { status: 500 });
  }
}