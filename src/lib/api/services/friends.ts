// src/lib/api/services/friends.ts
import { apiClient } from "../client";
import { SafeFriendship } from "@/types";
export const getFriendships = async (): Promise<SafeFriendship[]> => {
    const { data } = await apiClient.get<SafeFriendship[]>('/api/friends');
    return data;
  };
  
  export const sendFriendRequest = async (friendId: number): Promise<SafeFriendship> => {
    const { data } = await apiClient.post<SafeFriendship>('/api/friends', { friendId });
    return data;
  };
  
  export const respondToFriendRequest = async (
    friendshipId: number,
    action: 'accept' | 'decline'
  ): Promise<SafeFriendship> => {
    const { data } = await apiClient.put<SafeFriendship>(`/api/friendships/${friendshipId}`, { action });
    return data;
  };
  
  export const deleteFriendship = async (friendshipId: number): Promise<void> => {
    await apiClient.delete(`/api/friendships/${friendshipId}`);
  };