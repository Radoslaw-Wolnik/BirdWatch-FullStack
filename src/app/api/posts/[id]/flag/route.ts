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
  const { reason } = await req.json();

  if (!reason) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  try {
    const flaggedPost = await prisma.flaggedPost.create({
      data: {
        postId: postId,
        userId: parseInt(session.user.id),
        reason: reason,
      },
    });

    return NextResponse.json(flaggedPost, { status: 201 });
  } catch (error) {
    console.error("Error flagging post:", error);
    return NextResponse.json({ error: "Error flagging post" }, { status: 500 });
  }
}