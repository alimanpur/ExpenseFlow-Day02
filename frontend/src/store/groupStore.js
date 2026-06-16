import { create } from 'zustand';

export const useGroupStore = create((set) => ({
  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  isCreateModalOpen: false,
  setCreateModalOpen: (v) => set({ isCreateModalOpen: v }),
  isExpenseModalOpen: false,
  setExpenseModalOpen: (v) => set({ isExpenseModalOpen: v }),
}));
