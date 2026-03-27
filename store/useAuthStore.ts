import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (user: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      set({ user: null });
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  },
  checkAuth: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        set({ user: JSON.parse(userData), isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  }
}));
