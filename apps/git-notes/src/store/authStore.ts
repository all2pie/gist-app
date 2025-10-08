import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

type AuthState = {
  isLoggedIn: boolean;
  token?: string;
  user?: User;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: undefined,
      user: undefined,
      login: (token: string, user: User) =>
        set({
          isLoggedIn: true,
          token,
          user,
        }),
      logout: () =>
        set({ isLoggedIn: false, token: undefined, user: undefined }),
    }),
    { name: 'auth-storage' }
  )
);
