import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // Toasts
  toasts: [],

  // Alerts
  alerts: [],

  // System notifications
  notifications: [],

  // Unread count
  unreadCount: 0,

  // Add toast
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  // Remove toast
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Clear all toasts
  clearToasts: () => set({ toasts: [] }),

  // Shorthand methods
  success: (message, options = {}) => get().addToast({ type: 'success', message, ...options }),
  error: (message, options = {}) => get().addToast({ type: 'error', message, ...options }),
  warning: (message, options = {}) => get().addToast({ type: 'warning', message, ...options }),
  info: (message, options = {}) => get().addToast({ type: 'info', message, ...options }),

  // Add alert
  addAlert: (alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: 'info',
      dismissible: true,
      ...alert,
    };

    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));

    return id;
  },

  // Remove alert
  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    }));
  },

  // Clear all alerts
  clearAlerts: () => set({ alerts: [] }),

  // Set notifications
  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  // Add notification
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Mark notification as read
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // Mark all as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // Remove notification
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  // Clear all notifications
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;
