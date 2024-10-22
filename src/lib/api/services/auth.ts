// src/lib/api/services/auth.ts
import { LoginCredentials, RegisterData, AuthToken } from '@/types/global';
import { apiClient } from '../client';
import { SafeUser } from '@/types/global'; // not sure if not from types/models

export const login = async (credentials: LoginCredentials): Promise<AuthToken> => {
  const { data } = await apiClient.post<AuthToken>('/api/auth/login', credentials);
  return data;
};

export const register = async (userData: RegisterData): Promise<SafeUser> => {
  const { data } = await apiClient.post<SafeUser>('/api/auth/register', userData);
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
  localStorage.removeItem('token');
};
