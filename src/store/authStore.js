// src/store/authStore.js
import { create } from 'zustand';
import { authService } from '../api/services/authService'; // عدّل المسار حسب مكان الملف عندك
import config from '../config';

// يحدد صفحة الهبوط المناسبة حسب الدور
// ⚠️ لازم كل مسار هنا يكون موجود فعليًا في src/routes (routes.jsx)
function resolveHomeRoute(user) {
  if (!user) return '/login';

  switch (user.role) {
    case 'SuperAdmin':
    case 'MinistryAdmin':
      return '/overview';
    case 'FactoryUser':
      return '/entities-management';
    case 'WarehouseUser':
      return '/entities-management';
    case 'PharmacyUser':
      return '/medicine-batch-monitoring';
    default:
      return '/overview';
  }
}

export const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: '',

  async login({ email, password }) {
    set({ isLoading: true, error: '' });

    try {
      const data = await authService.login({ email, password });

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: '',
      });

      return { success: true, homeRoute: resolveHomeRoute(data.user) };
    } catch (err) {
      const message =
        err?.status === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : err?.message || 'حدث خطأ أثناء تسجيل الدخول';

      set({ isLoading: false, error: message, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  logout() {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: '' });
  },

  clearError() {
    set({ error: '' });
  },

  // تستخدم عند تحميل التطبيق عشان تتأكد إن الـ session لسه صالحة
  initializeAuth() {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    set({ user, isAuthenticated });
  },
}));