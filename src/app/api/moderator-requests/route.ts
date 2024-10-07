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

  const { description, qualifications, location } = await req.json();

  if (!description || !qualifications || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        posts: true,
        friends: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.posts.length < 10 || user.friends.length < 5) {
      return NextResponse.json({ error: "User does not meet requirements for moderator" }, { status: 403 });
    }

    const moderatorRequest = await prisma.moderatorRequest.create({
      data: {
        userId: user.id,
        description,
        qualifications,
        location,
      },
    });

    return NextResponse.json(moderatorRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating moderator request:", error);
    return NextResponse.json({ error: "Error creating moderator request" }, { status: 500 });
  }
}