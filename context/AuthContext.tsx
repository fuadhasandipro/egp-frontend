'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient, { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/axios';
import { User, LoginDto } from '@/types';

interface JwtPayload {
  sub?: string;
  id?: string;
  email?: string;
  role?: any;
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const res = await apiClient.get('/api/profile');
      const profileData = res.data?.data || res.data;
      if (profileData) {
        setUser(profileData);
        return profileData;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        if (token) {
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            const roleName = typeof decoded.role === 'string' ? decoded.role : decoded.role?.name || '';
            const tempUser: User = {
              id: decoded.sub || decoded.id || '',
              email: decoded.email || '',
              status: 'active',
              roleId: decoded.role?.id || '',
              role: decoded.role,
            };
            setUser(tempUser);
          } catch {}

          await refreshProfile();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshProfile]);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', dto);
      const data = res.data?.data || res.data;
      const { accessToken, refreshToken } = data;

      if (!accessToken) {
        throw new Error('Access token not returned from server');
      }

      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      const decoded = jwtDecode<JwtPayload>(accessToken);
      const tempUser: User = {
        id: decoded.sub || decoded.id || '',
        email: decoded.email || '',
        status: 'active',
        roleId: decoded.role?.id || '',
        role: decoded.role,
      };
      setUser(tempUser);

      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const role = user?.role?.name || (user as any)?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: typeof role === 'string' ? role : (role as any)?.name || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
