import { create } from 'zustand';

export const useExpenseStore = create((set) => ({
  filters: { search: '' },
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
}));
