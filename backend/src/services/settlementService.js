import prisma from '../config/db.js';
import { createActivity } from './activityService.js';
import { createNotification } from './notificationService.js';

export const recordSettlement = async (userId, { groupId, receiverId, amountCents }) => {
  if (!groupId || !receiverId || !amountCents) {
    throw Object.assign(new Error('groupId, receiverId, and amountCents are required.'), { statusCode: 400 });
  }

  const settlement = await prisma.settlement.create({
    data: { groupId, payerId: userId, receiverId, amountCents },
    include: {
      payer: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } }
    }
  });

  await createNotification({
    userId: receiverId,
    title: 'Settlement Pending Verification',
    message: `${settlement.payer.name} sent you $${(amountCents / 100).toFixed(2)}. Please verify.`,
    type: 'settlement'
  });

  return settlement;
};

export const verifySettlement = async (userId, settlementId) => {
  const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
  if (!settlement) throw Object.assign(new Error('Settlement not found.'), { statusCode: 404 });
  if (settlement.receiverId !== userId) throw Object.assign(new Error('Only the receiver can verify.'), { statusCode: 403 });
  if (settlement.verified) throw Object.assign(new Error('Already verified.'), { statusCode: 400 });

  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: { verified: true },
    include: {
      payer: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } }
    }
  });

  await createActivity({ userId, groupId: settlement.groupId, type: 'settlement_verified', meta: { amountCents: settlement.amountCents } });
  await createNotification({
    userId: settlement.payerId,
    title: 'Settlement Verified',
    message: `${updated.receiver.name} verified your payment of $${(settlement.amountCents / 100).toFixed(2)}.`,
    type: 'settlement'
  });

  return updated;
};

export const listGroupSettlements = async (groupId) => {
  return prisma.settlement.findMany({
    where: { groupId },
    include: {
      payer: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const listUserSettlements = async (userId) => {
  return prisma.settlement.findMany({
    where: { OR: [{ payerId: userId }, { receiverId: userId }] },
    include: {
      payer: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};
