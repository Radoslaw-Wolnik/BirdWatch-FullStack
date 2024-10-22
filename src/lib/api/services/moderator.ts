// src/lib/api/services/moderator.ts
import { PaginationParams, SafeFlaggedPost, SafeModeratorRequest } from "@/types";
import { ModeratorRequestData } from "../types/models";
import { apiClient } from "../client";

export const getModerationQueue = async (params: PaginationParams & { lat: number; lon: number }): Promise<SafeFlaggedPost[]> => {
    const { data } = await apiClient.get<SafeFlaggedPost[]>('/api/moderator', { params });
    return data;
  };
  
  export const handleFlaggedPost = async (
    flaggedPostId: number,
    action: 'RESOLVE' | 'DISMISS'
  ): Promise<void> => {
    await apiClient.post('/api/moderator', { flaggedPostId, action });
  };
  
  export const submitModeratorRequest = async (requestData: ModeratorRequestData): Promise<SafeModeratorRequest> => {
    const { data } = await apiClient.post<SafeModeratorRequest>('/api/moderator-requests', requestData);
    return data;
  };