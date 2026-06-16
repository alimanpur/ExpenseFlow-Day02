import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  dateRange: 'month',
  setDateRange: (r) => set({ dateRange: r }),
}));
