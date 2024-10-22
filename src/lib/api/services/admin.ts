// src/lib/api/services/admin.ts
import { apiClient } from '../client';
import { AnalyticsData } from '../types/models';
import { SafeUser, SafeFlaggedPost, SafeModeratorRequest } from '@/types/global';

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const { data } = await apiClient.get<AnalyticsData>('/api/admin/analytics');
  return data;
};

export const getInactiveUsers = async (): Promise<SafeUser[]> => {
  const { data } = await apiClient.get<SafeUser[]>('/api/admin?action=inactiveUsers');
  return data;
};

export const getModeratorRequests = async (): Promise<SafeModeratorRequest[]> => {
  const { data } = await apiClient.get<SafeModeratorRequest[]>('/api/admin?action=moderatorRequests');
  return data;
};

export const getFlaggedPosts = async (): Promise<SafeFlaggedPost[]> => {
  const { data } = await apiClient.get<SafeFlaggedPost[]>('/api/admin?action=flaggedPosts');
  return data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.post('/api/admin', { action: 'deleteUser', id: userId });
};

export const approveModerator = async (requestId: number): Promise<void> => {
  await apiClient.post('/api/admin', { action: 'approveModerator', id: requestId });
};

export const deletePost = async (postId: number): Promise<void> => {
  await apiClient.post('/api/admin', { action: 'deletePost', id: postId });
};