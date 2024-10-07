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

  const { friendId } = await req.json();

  try {
    const friendship = await prisma.friendship.create({
      data: {
        userId: parseInt(session.user.id),
        friendId: friendId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json({ error: "Error sending friend request" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: parseInt(session.user.id), status: 'ACCEPTED' },
          { friendId: parseInt(session.user.id), status: 'ACCEPTED' },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Error fetching friends" }, { status: 500 });
  }
}