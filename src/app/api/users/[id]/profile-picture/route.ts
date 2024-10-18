// File: src/app/api/users/[id]/profile-picture/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/fileUpload';
import { UnauthorizedError, BadRequestError, InternalServerError, AppError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id.toString() !== params.id) {
      throw new UnauthorizedError('Unauthorized to update this profile');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw new BadRequestError('No file uploaded');
    }

    const fileUrl = await uploadFile(file, 'profile', params.id, ['image/jpeg', 'image/png', 'image/webp']);

    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: { profilePicture: fileUrl },
      select: { id: true, username: true, profilePicture: true }
    });

    logger.info('Profile picture updated', { userId: session.user.id, fileUrl });
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unhandled error in profile picture upload', { error });
    throw new InternalServerError();
  }
}