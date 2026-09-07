import apiClient from '@/lib/axios';
import { ApiResponse, LoginDto, AuthTokens } from '@/types';

export const authService = {
  async login(dto: LoginDto): Promise<AuthTokens> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/api/auth/login', dto);
    return res.data?.data || (res.data as any);
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/api/auth/refresh', { refreshToken });
    return res.data?.data || (res.data as any);
  },

  async logout(): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/api/auth/logout');
    return res.data?.data || (res.data as any);
  },
};
