// src/lib/api/services/feed.ts
import { PaginationParams } from '../types/models';
import { SafeBirdPost } from '@/types/global';
import { apiClient } from '../client';

export const getFeedPosts = async (params: PaginationParams): Promise<SafeBirdPost[]> => {
  const { data } = await apiClient.get<SafeBirdPost[]>('/api/feed', { params });
  return data;
};