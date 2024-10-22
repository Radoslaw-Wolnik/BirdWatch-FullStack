// src/lib/api/services/map.ts
import { apiClient } from "../client";
import { SafeBirdPost } from "@/types";
import { MapViewParams } from "../types/models";

export const getMapPosts = async (params: MapViewParams): Promise<SafeBirdPost[]> => {
    const { data } = await apiClient.get<SafeBirdPost[]>('/api/map', { params });
    return data;
  };