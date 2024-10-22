// src/lib/api/services/birds.ts
import { SafeBird, SafeBirdIcon } from '@/types/global';
import { SafeSubmitBirdIcon } from '@/types/global';
import { apiClient } from '../client';

export const submitBirdIcon = async (birdSpecies: string, icon: File): Promise<SafeSubmitBirdIcon> => {
  const formData = new FormData();
  formData.append('birdSpecies', birdSpecies);
  formData.append('icon', icon);

  const { data } = await apiClient.post<SafeSubmitBirdIcon>('/api/bird-icons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getBirdIconSubmissions = async (): Promise<SafeSubmitBirdIcon[]> => {
  const { data } = await apiClient.get<SafeSubmitBirdIcon[]>('/api/bird-icons');
  return data;
};
