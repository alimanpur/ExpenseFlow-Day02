import { create } from 'zustand';

export const useSettlementStore = create((set) => ({
  filter: 'pending', // 'pending' | 'verified' | 'all'
  setFilter: (f) => set({ filter: f }),
  isRecordModalOpen: false,
  setRecordModalOpen: (v) => set({ isRecordModalOpen: v }),
}));
