// src/lib/api/services/search.ts
import { SearchParams } from "../types/models";
import { SafeBird, SafeBirdPost } from "@/types";
import { apiClient } from "../client";

export const searchBirds = async (params: SearchParams): Promise<{
    results: SafeBird[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> => {
    const { data } = await apiClient.get('/api/search', {
      params: { ...params, type: 'birds' },
    });
    return data;
  };
  
  export const searchPosts = async (params: SearchParams): Promise<{
    results: SafeBirdPost[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> => {
    const { data } = await apiClient.get('/api/search', {
      params: { ...params, type: 'posts' },
    });
    return data;
  };