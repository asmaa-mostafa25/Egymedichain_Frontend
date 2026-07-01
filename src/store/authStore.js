import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import config from '../config';
import authApi from '../api/auth.api';

const DEMO_ACCOUNT = {
  email: 'demo@medichain.local',
  password: 'demo1234',
  role: 'MOH_ADMIN',
  user: {
    id: 'demo-user',
    name: 'Demo Administrator',
    email: 'demo@medichain.local',
    role: 'MOH_ADMIN',
    permissions: [],
  },
};

const DEMO_TOKEN = 'demo-local-auth-token';
const DEMO_REFRESH_TOKEN = 'demo-local-refresh-token';

const createDemoSession = () => ({
  token: DEMO_TOKEN,
  refreshToken: DEMO_REFRESH_TOKEN,
  user: DEMO_ACCOUNT.user,
  role: DEMO_ACCOUNT.role,
  isAuthenticated: true,
});

const getLoginErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  return error?.message || error?.error?.message || 'Login failed';
};

const extractAuthPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const source = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  return {
    token: source.token || source.accessToken || source.access_token || source.jwt || source.jwtToken,
    refreshToken: source.refreshToken || source.refresh_token || source.refreshTokenValue,
    user: source.user || source.profile || source.account || source.data?.user || source.data?.profile || source.data?.account,
  };
};

const isBackendUnavailable = (error) => {
  const status = error?.status;
  const message = String(getLoginErrorMessage(error)).toLowerCase();

  return (
    status === 0 ||
    status === 404 ||
    status >= 500 ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    message.includes('econnrefused')
  );
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);

          if (response.success && response.data) {
            const { token, refreshToken, user } = extractAuthPayload(response.data);

            if (!token || !refreshToken || !user) {
              throw new Error(response.message || 'Invalid authentication response');
            }

            let decoded = null;
            try {
              decoded = jwtDecode(token);
            } catch {
              decoded = null;
            }

            const role = decoded?.role || user?.role || response.data?.role || response.data?.user?.role;

            const session = {
              token,
              refreshToken,
              user,
              role,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };

            set(session);
            localStorage.setItem(config.TOKEN_KEY, token);
            localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem(config.USER_KEY, JSON.stringify(user));

            return { success: true };
          }

          throw new Error(response.message || 'Login failed');
        } catch (error) {
          const errorMessage = getLoginErrorMessage(error);

          if (
            config.ENABLE_DEMO_AUTH &&
            isBackendUnavailable(error) &&
            credentials?.email &&
            credentials?.password
          ) {
            const demoSession = createDemoSession();

            set({
              ...demoSession,
              isLoading: false,
              error: null,
            });

            localStorage.setItem(config.TOKEN_KEY, demoSession.token);
            localStorage.setItem(config.REFRESH_TOKEN_KEY, demoSession.refreshToken);
            localStorage.setItem(config.USER_KEY, JSON.stringify(demoSession.user));

            return { success: true };
          }

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        localStorage.removeItem(config.TOKEN_KEY);
        localStorage.removeItem(config.REFRESH_TOKEN_KEY);
        localStorage.removeItem(config.USER_KEY);

        set({
          token: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setTokens: (token, refreshToken) => {
        let decoded = null;
        try {
          decoded = jwtDecode(token);
        } catch {
          decoded = null;
        }

        set({
          token,
          refreshToken,
          role: decoded?.role || null,
          isAuthenticated: true,
        });
        localStorage.setItem(config.TOKEN_KEY, token);
        localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
      },

      setUser: (user) => {
        set({ user });
        localStorage.setItem(config.USER_KEY, JSON.stringify(user));
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        const hasValidAuth = get().checkAuth();
        set({ isLoading: false });
        return hasValidAuth;
      },

      checkAuth: () => {
        const token = localStorage.getItem(config.TOKEN_KEY);
        const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);
        const userStr = localStorage.getItem(config.USER_KEY);

        if (token === DEMO_TOKEN && refreshToken === DEMO_REFRESH_TOKEN) {
          const user = userStr ? JSON.parse(userStr) : DEMO_ACCOUNT.user;
          const role = user?.role || DEMO_ACCOUNT.role;

          set({
            token,
            refreshToken,
            user,
            role,
            isAuthenticated: true,
          });

          return true;
        }

        if (token && refreshToken) {
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              // Token expired
              get().logout();
              return false;
            }

            const user = userStr ? JSON.parse(userStr) : null;
            set({
              token,
              refreshToken,
              user,
              role: decoded.role || user?.role,
              isAuthenticated: true,
            });
            return true;
          } catch {
            get().logout();
            return false;
          }
        }
        return false;
      },

      hasRole: (requiredRoles) => {
        const { role } = get();
        if (!role) return false;
        if (Array.isArray(requiredRoles)) {
          return requiredRoles.includes(role);
        }
        return role === requiredRoles;
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user?.permissions) return false;
        return user.permissions.includes(permission);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'egy-medichain-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
