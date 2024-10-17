// src/types/prisma.ts

import { Prisma } from '@prisma/client';

// Export full Prisma types
export type User = Prisma.UserGetPayload<{}>;
export type Bird = Prisma.BirdGetPayload<{}>;
export type BirdPost = Prisma.BirdPostGetPayload<{}>;
export type Like = Prisma.LikeGetPayload<{}>;
export type Dislike = Prisma.DislikeGetPayload<{}>;
export type Friendship = Prisma.FriendshipGetPayload<{}>;
export type ModeratorRequest = Prisma.ModeratorRequestGetPayload<{}>;
export type FlaggedPost = Prisma.FlaggedPostGetPayload<{}>;
export type BirdIcon = Prisma.BirdIconGetPayload<{}>;
export type SubmitBirdIcon = Prisma.SubmitBirdIconGetPayload<{}>;
export type Token = Prisma.TokenGetPayload<{}>;

// Export Enums directly from Prisma
export {
  UserRole,
  FriendshipStatus,
  RequestStatus,
  FlagStatus,
  SubmissionStatus,
  TokenType
} from '@prisma/client';

// You can also export some useful Prisma namespace types if needed
export type Enumerable<T> = T | Array<T>;
export type NonNullable<T> = T extends null | undefined ? never : T;