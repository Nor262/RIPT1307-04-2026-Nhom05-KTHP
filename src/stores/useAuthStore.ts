import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '@/utils/axios';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (data) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        window.location.href = '/user/login';
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await axios.get('/auth/me');
          if (response?.data?.data) {
            set({ user: response.data.data, isAuthenticated: true });
          }
        } catch (error) {
          // Lỗi đã được axios interceptor xử lý (logout nếu 401)
          console.error('Failed to fetch profile', error);
        }
      },
    }),
    {
      name: 'auth-storage', // Tên lưu trong localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
