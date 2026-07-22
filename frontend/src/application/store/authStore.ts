import { create } from 'zustand';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../../infrastructure/api/client';
import {
  loginApi,
  logoutApi,
  meApi,
  registerApi,
  type UserDto,
} from '../../infrastructure/api/auth';

interface AuthStore {
  user: UserDto | null;
  loading: boolean;
  bootstrapped: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserDto>;
  register: (input: {
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    password: string;
  }) => Promise<UserDto>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  bootstrapped: false,
  error: null,

  bootstrap: async () => {
    if (!getAccessToken()) {
      set({ user: null, bootstrapped: true });
      return;
    }
    try {
      const user = await meApi();
      set({ user, bootstrapped: true, error: null });
    } catch {
      clearTokens();
      set({ user: null, bootstrapped: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await loginApi(email, password);
      set({ user, loading: false, bootstrapped: true, error: null });
      return user;
    } catch (e) {
      const msg = (e as Error).message;
      set({ loading: false, error: msg });
      throw e;
    }
  },

  register: async (input) => {
    set({ loading: true, error: null });
    try {
      const { user, tokens } = await registerApi(input);
      // Session active immédiatement après inscription (tokens déjà stockés par registerApi).
      if (!tokens?.access) {
        throw new Error('Inscription réussie mais session non créée.');
      }
      set({ user, loading: false, bootstrapped: true, error: null });
      return user;
    } catch (e) {
      const msg = (e as Error).message;
      set({ loading: false, error: msg });
      throw e;
    }
  },

  logout: async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await logoutApi(refresh);
      } catch {
        clearTokens();
      }
    } else {
      clearTokens();
    }
    set({ user: null });
  },
}));
