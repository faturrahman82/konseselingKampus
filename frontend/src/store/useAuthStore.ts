import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { disconnectSocket } from '@/api/socket';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;       // fullName dari profile
  role: string;        // 'student' | 'counselor' | 'admin' (lowercase dari BE)
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        disconnectSocket();
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
