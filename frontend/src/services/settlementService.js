import api from './api';

export const settlementService = {
  recordSettlement: async (payload) => {
    const { data } = await api.post('/settlements', payload);
    return data?.data ?? data;
  },
  verifySettlement: async (id) => {
    const { data } = await api.patch(`/settlements/${id}/verify`);
    return data?.data ?? data;
  },
  listGroupSettlements: async (groupId) => {
    const { data } = await api.get(`/settlements/group/${groupId}`);
    return data?.data ?? [];
  },
  listMySettlements: async () => {
    const { data } = await api.get('/settlements/mine');
    return data?.data ?? [];
  },
};
