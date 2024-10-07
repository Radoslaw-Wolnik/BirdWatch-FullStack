import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
    console.error("Error fetching inactive users:", error);
    return NextResponse.json({ error: "Error fetching inactive users" }, { status: 500 });
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
    console.error("Error fetching moderator requests:", error);
    return NextResponse.json({ error: "Error fetching moderator requests" }, { status: 500 });
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
    console.error("Error fetching flagged posts:", error);
    return NextResponse.json({ error: "Error fetching flagged posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

async function deleteUser(userId: number) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
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
    console.error("Error approving moderator:", error);
    return NextResponse.json({ error: "Error approving moderator" }, { status: 500 });
  }
}

async function deletePost(postId: number) {
  try {
    await prisma.birdPost.delete({ where: { id: postId } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Error deleting post" }, { status: 500 });
  }
}