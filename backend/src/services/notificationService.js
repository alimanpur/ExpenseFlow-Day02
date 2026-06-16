import prisma from '../config/db.js';

export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  return prisma.notification.create({ data: { userId, title, message, type } });
};

export const getUserNotifications = async (userId, onlyUnread = false) => {
  return prisma.notification.findMany({
    where: { userId, ...(onlyUnread ? { read: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

export const markNotificationsRead = async (userId, ids) => {
  return prisma.notification.updateMany({
    where: { userId, ...(ids?.length ? { id: { in: ids } } : {}) },
    data: { read: true }
  });
};
