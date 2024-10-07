import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = parseInt(params.id);

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ message: "Like removed" });
    } else {
      const newLike = await prisma.like.create({
        data: {
          userId: parseInt(session.user.id),
          postId: postId,
        },
      });
      return NextResponse.json(newLike, { status: 201 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Error toggling like" }, { status: 500 });
  }
}