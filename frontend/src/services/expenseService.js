import api from './api';

export const expenseService = {
  addExpense: async (payload) => {
    const { data } = await api.post('/expenses/manual', payload);
    return data?.data ?? data;
  },
  deleteExpense: async (id) => {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  },
  getCategories: async () => {
    const { data } = await api.get('/expenses/categories');
    return data?.data ?? [];
  },
  addCategory: async (payload) => {
    const { data } = await api.post('/expenses/categories', payload);
    return data?.data ?? data;
  },
  uploadReceipt: async (file) => {
    const form = new FormData();
    form.append('receipt', file);
    const { data } = await api.post('/upload/receipt', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data?.data ?? data;
  },
  parseAI: async (payload) => {
    const { data } = await api.post('/ai/parse-expense', payload);
    return data?.data ?? data;
  },
  aiQuickAdd: async (payload) => {
    const { data } = await api.post('/ai/quick-add', payload);
    return data;
  },
};
