import api from './api';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data?.data ?? data;
  },
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/me', profileData);
    return data;
  },
  changePassword: async (payload) => {
    const { data } = await api.put('/auth/password', payload);
    return data;
  },
  updateSettings: async (settingsData) => {
    const { data } = await api.put('/auth/settings', settingsData);
    return data;
  },
  exportData: async () => {
    const { data } = await api.get('/auth/export');
    return data?.data ?? data;
  },
  deleteAccount: async (password) => {
    const { data } = await api.delete('/auth/account', { data: { password } });
    return data;
  },
};
