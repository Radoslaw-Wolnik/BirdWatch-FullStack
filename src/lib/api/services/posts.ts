// src/lib/api/services/posts.ts
import { SafeBirdPost } from "@/types";
import { PaginationParams, UpdatePostData } from "../types/models";
import { apiClient } from "../client";

export interface CreatePostData {
    description: string;
    latitude: number;
    longitude: number;
    birdSpecies: string;
    photos?: FileList | File[]; // Make it more specific about what type of files we accept
  }
  
  export const createPost = async (postData: CreatePostData): Promise<SafeBirdPost> => {
    const formData = new FormData();
    const { photos, ...restData } = postData;
  
    // Handle the rest of the data
    Object.entries(restData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  
    // Handle photos separately
    if (photos) {
      // If it's a FileList, convert to array
      const photoArray = Array.from(photos);
      photoArray.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
  
    const { data } = await apiClient.post<SafeBirdPost>('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  };
  
  export const getPosts = async (params: PaginationParams & { sortBy?: string; order?: 'asc' | 'desc' }): Promise<{
    posts: SafeBirdPost[];
    totalPages: number;
    currentPage: number;
  }> => {
    const { data } = await apiClient.get('/api/posts', { params });
    return data;
  };
  
  export const getPostById = async (postId: number): Promise<SafeBirdPost> => {
    const { data } = await apiClient.get<SafeBirdPost>(`/api/posts/${postId}`);
    return data;
  };
  
  export const updatePost = async (postId: number, updateData: UpdatePostData): Promise<SafeBirdPost> => {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });
  
    const { data } = await apiClient.put<SafeBirdPost>(`/api/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  };
  
  export const deletePost = async (postId: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  };
  
  export const likePost = async (postId: number): Promise<void> => {
    await apiClient.post(`/api/posts/${postId}/reactions`, { type: 'like' });
  };
  
  export const dislikePost = async (postId: number): Promise<void> => {
    await apiClient.post(`/api/posts/${postId}/reactions`, { type: 'dislike' });
  };
  
  export const removeReaction = async (postId: number, type: 'like' | 'dislike'): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}/reactions`, { data: { type } });
  };
  
  export const flagPost = async (postId: number, reason: string): Promise<void> => {
    await apiClient.post(`/api/posts/${postId}/flag`, { reason });
  };
  