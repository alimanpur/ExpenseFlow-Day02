import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  notifications: [],
  setNotifications: (list) => set({ notifications: list }),
}));
