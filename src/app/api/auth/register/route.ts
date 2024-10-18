// File: src/pages/api/auth/register.ts

import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { registerUserSchema } from '@/lib/validationSchemas';
import { BadRequestError, ConflictError } from '@/lib/errors';
import { SafeUser } from '@/types/global';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validatedData = registerUserSchema.parse(req.body);
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    const safeUser: SafeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
      createdAt: newUser.createdAt,
      lastActive: newUser.lastActive,
      deactivated: null,
    };

    res.status(201).json(safeUser);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ConflictError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}