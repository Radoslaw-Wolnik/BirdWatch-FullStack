// src/lib/api/types/models.ts
import { 
    SafeUser, 
    SafeBirdPost, 
    SafeBird, 
    SafeFriendship, 
    SafeModeratorRequest, 
    SafeFlaggedPost,
    SafeBirdIcon,
    SafeSubmitBirdIcon,
    UserRole
  } from '@/types/global';
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  export interface SearchParams extends PaginationParams {
    query: string;
  }
  
  export interface MapViewParams {
    lat: number;
    lon: number;
    radius?: number;
    species?: string[];
  }
  
  export interface CreatePostData {
    description: string;
    latitude: number;
    longitude: number;
    birdSpecies: string;
    photos?: FileList | File[];
  }
  
  export interface UpdatePostData {
    description?: string;
    birdSpecies?: string;
    photo?: File;
  }
  
  export interface ModeratorRequestData {
    description: string;
    qualifications: string;
    location: string;
  }
  
  export interface UpdateProfileData {
    username?: string;
    profilePicture?: string;
  }
  
  export interface AnalyticsData {
    userStats: {
      totalUsers: number;
      newUsersLastWeek: number;
    };
    postStats: {
      totalPosts: number;
      newPostsLastWeek: number;
    };
    topBirds: {
      id: number;
      name: string;
      species: string;
      postCount: number;
    }[];
    topPosters: {
      id: number;
      username: string;
      postCount: number;
    }[];
    moderationStats: {
      pendingFlaggedPosts: number;
    };
  }