import api from './api';

export const groupService = {
  listGroups: async () => {
    const { data } = await api.get('/groups');
    return data?.data ?? [];
  },
  getGroupLedger: async (groupId) => {
    const { data } = await api.get(`/groups/${groupId}`);
    return data?.data ?? null;
  },
  createGroup: async (payload) => {
    const { data } = await api.post('/groups/create', payload);
    return data?.data ?? data;
  },
  updateGroup: async (groupId, payload) => {
    const { data } = await api.put(`/groups/${groupId}`, payload);
    return data?.data ?? data;
  },
  deleteGroup: async (groupId) => {
    const { data } = await api.delete(`/groups/${groupId}`);
    return data;
  },
  joinGroup: async (groupId) => {
    const { data } = await api.post('/groups/join', { groupId });
    return data?.data ?? data;
  },
  inviteMember: async (groupId, email) => {
    const { data } = await api.post(`/groups/${groupId}/invite`, { email });
    return data?.data ?? data;
  },
  removeMember: async (groupId, userId) => {
    const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
    return data;
  },
  acceptInvite: async (token) => {
    const { data } = await api.post(`/groups/invites/${token}/accept`);
    return data?.data ?? data;
  },
};
