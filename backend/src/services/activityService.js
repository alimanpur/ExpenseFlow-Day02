import prisma from '../config/db.js';

export const createActivity = async ({ userId, groupId, type, meta }) => {
  return prisma.activity.create({
    data: { userId, groupId: groupId ?? null, type, meta: meta ?? {} }
  });
};

export const getGroupActivity = async (groupId, limit = 20) => {
  return prisma.activity.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

export const getUserActivity = async (userId, limit = 30) => {
  return prisma.activity.findMany({
    where: { userId },
    include: { group: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};
