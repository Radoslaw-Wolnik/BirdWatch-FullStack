// File: src/app/api/bird-icons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError, ForbiddenError, InternalServerError, AppError } from '@/lib/errors';
import { SafeSubmitBirdIcon, UserRole } from '@/types/global';
import { uploadFile } from '@/lib/fileUpload';
import { z } from 'zod';

const submitBirdIconSchema = z.object({
  birdSpecies: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const birdSpecies = formData.get('birdSpecies') as string;
    const icon = formData.get('icon') as File | null;

    submitBirdIconSchema.parse({ birdSpecies });

    if (!icon) {
      throw new BadRequestError('No file uploaded');
    }

    const iconUrl = await uploadFile(icon, 'bird-icon', session.user.id, ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

    const submission = await prisma.submitBirdIcon.create({
      data: {
        url: iconUrl,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });

    return NextResponse.json(submission as SafeSubmitBirdIcon, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Submit bird icon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MODERATOR) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const submissions = await prisma.submitBirdIcon.findMany({
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true, role: true }
        },
      },
    });
    return NextResponse.json(submissions as SafeSubmitBirdIcon[]);
  } catch (error) {
    console.error('Get bird icon submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}