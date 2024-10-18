// File: src/types/global.ts

import {
  User,
  Bird,
  BirdPost,
  Like,
  Dislike,
  Friendship,
  ModeratorRequest,
  FlaggedPost,
  BirdIcon,
  SubmitBirdIcon,
  UserRole,
  FriendshipStatus,
  RequestStatus,
  FlagStatus,
  SubmissionStatus,
  TokenType
} from './prisma';

// User types
export type SafeUser = Omit<User, 'password' | 'tokens'>;

export type PublicUser = Pick<User, 'id' | 'username' | 'profilePicture' | 'role'>;

// Bird types
export type SafeBird = Omit<Bird, 'iconId'> & {
  icon?: SafeBirdIcon;
};

// BirdPost types
export type SafeBirdPost = Omit<BirdPost, 'userId'> & {
  user: PublicUser;
  bird: SafeBird;
};

// Like and Dislike types
export type SafeLike = Omit<Like, 'userId'> & {
  user: PublicUser;
};

export type SafeDislike = Omit<Dislike, 'userId'> & {
  user: PublicUser;
};

// Friendship types
export type SafeFriendship = Omit<Friendship, 'userId' | 'friendId'> & {
  user: PublicUser;
  friend: PublicUser;
};

// ModeratorRequest types
export type SafeModeratorRequest = Omit<ModeratorRequest, 'userId'> & {
  user: PublicUser;
};

// FlaggedPost types
export type SafeFlaggedPost = Omit<FlaggedPost, 'userId'> & {
  user: PublicUser;
  post: SafeBirdPost;
};

// BirdIcon types
export type SafeBirdIcon = Omit<BirdIcon, 'uploadedById'> & {
  uploadedBy: PublicUser;
};

// SubmitBirdIcon types
export type SafeSubmitBirdIcon = Omit<SubmitBirdIcon, 'userId'> & {
  user: PublicUser;
};

// Authentication types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type AuthToken = {
  token: string;
  expiresAt: Date;
};

// Other utility types
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type SortParams = {
  field: string;
  order: 'asc' | 'desc';
};

// Session User type
export interface SessionUser extends SafeUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

// Re-export enums from Prisma
export { UserRole, FriendshipStatus, RequestStatus, FlagStatus, SubmissionStatus, TokenType };

