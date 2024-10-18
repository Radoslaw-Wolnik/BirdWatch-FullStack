import { z } from 'zod';
import { Coordinates, RegisterData } from '../types/global';

export const createPostSchema = z.object({
  birdSpecies: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photos: z.array(z.string().url()).optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

export const registerUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
}) satisfies z.ZodType<RegisterData>;

export const moderatorRequestSchema = z.object({
  description: z.string().min(10).max(500),
  qualifications: z.string().min(10).max(500),
  location: z.string().min(2).max(100),
});

export type ModeratorRequestData = z.infer<typeof moderatorRequestSchema>;

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}) satisfies z.ZodType<Coordinates>;

// Add more schemas as needed