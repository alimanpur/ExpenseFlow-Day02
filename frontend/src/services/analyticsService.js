import api from './api';

export const analyticsService = {
  getMonthlySpending: async () => {
    const { data } = await api.get('/analytics/monthly');
    return data?.data ?? [];
  },
  getCategorySpending: async () => {
    const { data } = await api.get('/analytics/categories');
    return data?.data ?? [];
  },
  getSettlementRate: async () => {
    const { data } = await api.get('/analytics/settlement-rate');
    return data?.data ?? { total: 0, verified: 0, rate: 0 };
  },
  getSpendingForecast: async () => {
    const { data } = await api.get('/analytics/forecast');
    return data?.data ?? { forecast: [], trend: 'stable' };
  },
  getGroupComparison: async () => {
    const { data } = await api.get('/analytics/group-comparison');
    return data?.data ?? [];
  },
  getNetBalance: async () => {
    const { data } = await api.get('/analytics/net-balance');
    return data?.data ?? { totalOwedToMe: 0, totalIOwe: 0, net: 0, pendingSettlements: [] };
  },
  getGroupDebtors: async (groupId) => {
    const { data } = await api.get(`/analytics/groups/${groupId}/debtors`);
    return data?.data ?? [];
  },
  getGroupCreditors: async (groupId) => {
    const { data } = await api.get(`/analytics/groups/${groupId}/creditors`);
    return data?.data ?? [];
  },
  getGroupHealth: async (groupId) => {
    const { data } = await api.get(`/analytics/groups/${groupId}/health`);
    return data?.data ?? {};
  },
  getMemberComparison: async (groupId) => {
    const { data } = await api.get(`/analytics/groups/${groupId}/members`);
    return data?.data ?? [];
  },
  getUserActivity: async () => {
    const { data } = await api.get('/activity/me');
    return data?.data ?? [];
  },
  getGroupActivity: async (groupId) => {
    const { data } = await api.get(`/activity/groups/${groupId}`);
    return data?.data ?? [];
  },
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data?.data ?? [];
  },
  markNotificationsRead: async (ids) => {
    const { data } = await api.patch('/notifications/read', { ids });
    return data;
  },
};
