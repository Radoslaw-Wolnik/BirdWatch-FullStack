// src/lib/api/services/users.ts
import { apiClient } from "../client";
import { SafeUser } from "@/types";
import { UpdateProfileData } from "../types/models";

export const getProfile = async (userId: number): Promise<SafeUser> => {
    const { data } = await apiClient.get<SafeUser>(`/api/users/${userId}/profile`);
    return data;
  };
  
  export const updateProfile = async (userId: number, updateData: UpdateProfileData): Promise<SafeUser> => {
    const { data } = await apiClient.put<SafeUser>(`/api/users/${userId}/profile`, updateData);
    return data;
  };
  
  export const updateProfilePicture = async (userId: number, file: File): Promise<{ profilePicture: string }> => {
    const formData = new FormData();
    formData.append('file', file);
  
    const { data } = await apiClient.post<{ profilePicture: string }>(
      `/api/users/${userId}/profile-picture`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  };
  
  export const searchUsers = async (query: string): Promise<SafeUser[]> => {
    const { data } = await apiClient.get<SafeUser[]>('/api/users/search', {
      params: { q: query },
    });
    return data;
  };