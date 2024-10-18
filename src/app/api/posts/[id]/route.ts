// File: src/app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { createPostSchema } from '@/lib/validationSchemas';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError, InternalServerError, AppError } from '@/lib/errors';
import { SafeBirdPost } from '@/types/global';
import { uploadFile } from '@/lib/fileUpload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = parseInt(params.id, 10);
    const post = await prisma.birdPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        bird: true,
      },
    });
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return NextResponse.json(post as SafeBirdPost);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const postId = parseInt(params.id, 10);
    const post = await prisma.birdPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.userId !== session.user.id) {
      throw new ForbiddenError('You are not authorized to update this post');
    }

    const formData = await req.formData();
    const validatedData = createPostSchema.parse(Object.fromEntries(formData));
    const photoFile = formData.get('photo') as File | null;

    let photoUrl: string | undefined;
    if (photoFile) {
      photoUrl = await uploadFile(photoFile, 'post', postId, ['image/jpeg', 'image/png', 'image/webp']);
    }

    const updatedPost = await prisma.birdPost.update({
      where: { id: postId },
      data: {
        ...validatedData,
        photos: photoUrl ? [photoUrl] : undefined,
        birdId: (await prisma.bird.findFirstOrThrow({ where: { species: validatedData.birdSpecies } })).id,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
        bird: true,
      },
    });

    return NextResponse.json(updatedPost as SafeBirdPost);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const postId = parseInt(params.id, 10);
    const post = await prisma.birdPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    if (post.userId !== session.user.id) {
      throw new ForbiddenError('You are not authorized to delete this post');
    }

    await prisma.birdPost.delete({ where: { id: postId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}