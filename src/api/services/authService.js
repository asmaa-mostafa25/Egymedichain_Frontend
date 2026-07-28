import { httpClient, setTokens, clearSession, getRefreshToken } from '../httpClient';
import config from '../../config';

export const authService = {
  async login(credentials) {
    const email = credentials?.email ?? credentials;
    const password = credentials?.password ?? arguments[1];

    const data = await httpClient.post('/auth/login', { email, password });

    setTokens(data.token, data.refreshToken);

    const user = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      entityType: data.entityType,
    };

    localStorage.setItem(config.USER_KEY, JSON.stringify(user));

    return {
      ...data,
      user,
    };
  },

  async changePassword() {
    throw new Error('Change password API is not available yet');
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await httpClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // best-effort — still clear the local session even if the server call fails
    }
    clearSession();
  },

  getCurrentUser() {
    const raw = localStorage.getItem(config.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(config.TOKEN_KEY);
  },
};