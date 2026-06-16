import prisma from '../config/db.js';
import { calculateOptimalSettlements } from './debtEngine.js';
import { createActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import crypto from 'crypto';

export const calculateGroupBalances = (members, expenses, settlements) => {
  const balances = {};
  members.forEach(m => { balances[m.userId] = 0; });

  expenses.forEach(exp => {
    balances[exp.payerId] = (balances[exp.payerId] || 0) + exp.amountCents;
    exp.splits.forEach(split => {
      balances[split.userId] = (balances[split.userId] || 0) - split.amountCents;
    });
  });

  settlements.forEach(s => {
    if (s.verified) {
      balances[s.payerId] = (balances[s.payerId] || 0) + s.amountCents;
      balances[s.receiverId] = (balances[s.receiverId] || 0) - s.amountCents;
    }
  });

  return balances;
};

export const createGroup = async (userId, { name, description, currency }) => {
  const group = await prisma.group.create({
    data: {
      name,
      description,
      currency: currency ?? 'USD',
      ownerId: userId,
      members: { create: { userId } }
    }
  });
  await createActivity({ userId, groupId: group.id, type: 'group_created', meta: { groupName: name } });
  return group;
};

export const updateGroup = async (userId, groupId, { name, description, currency }) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw Object.assign(new Error('Group not found.'), { statusCode: 404 });
  if (group.ownerId !== userId) throw Object.assign(new Error('Only the owner can edit this group.'), { statusCode: 403 });

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (currency !== undefined) data.currency = currency;

  const updated = await prisma.group.update({ where: { id: groupId }, data });
  await createActivity({ userId, groupId, type: 'group_updated', meta: { groupName: updated.name } });
  return updated;
};

export const deleteGroup = async (userId, groupId) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw Object.assign(new Error('Group not found.'), { statusCode: 404 });
  if (group.ownerId !== userId) throw Object.assign(new Error('Only the owner can delete this group.'), { statusCode: 403 });

  // Cascade handled by Prisma schema relations
  return prisma.group.delete({ where: { id: groupId } });
};

export const removeMember = async (requestingUserId, groupId, targetUserId) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw Object.assign(new Error('Group not found.'), { statusCode: 404 });

  const canRemove = group.ownerId === requestingUserId || requestingUserId === targetUserId;
  if (!canRemove) throw Object.assign(new Error('Not authorized to remove this member.'), { statusCode: 403 });

  if (targetUserId === group.ownerId) {
    throw Object.assign(new Error('Cannot remove the group owner.'), { statusCode: 400 });
  }

  await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId: targetUserId } } });
  await createActivity({ userId: requestingUserId, groupId, type: 'member_removed', meta: {} });
};

export const listUserGroups = async (userId) => {
  return prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { expenses: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getGroupLedger = async (groupId, requestingUserId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      expenses: {
        include: { splits: true, payer: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      settlements: {
        include: { payer: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!group) return null;

  const isMember = group.members.some(m => m.userId === requestingUserId);
  if (!isMember) throw Object.assign(new Error('Not a member of this group.'), { statusCode: 403 });

  const optimalResolutionPaths = calculateOptimalSettlements(group.members, group.expenses, group.settlements);
  const balances = calculateGroupBalances(group.members, group.expenses, group.settlements);

  return {
    group: { id: group.id, name: group.name, description: group.description, currency: group.currency, ownerId: group.ownerId },
    members: group.members,
    expenses: group.expenses,
    settlements: group.settlements,
    optimalResolutionPaths,
    balances
  };
};

export const joinGroupById = async (userId, groupId) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw Object.assign(new Error('Group not found.'), { statusCode: 404 });

  const existing = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
  if (existing) throw Object.assign(new Error('Already a member.'), { statusCode: 409 });

  const member = await prisma.groupMember.create({ data: { groupId, userId } });
  await createActivity({ userId, groupId, type: 'member_joined', meta: { groupName: group.name } });

  const groupMembers = await prisma.groupMember.findMany({ where: { groupId } });
  await Promise.all(
    groupMembers.filter(m => m.userId !== userId).map(m =>
      createNotification({ userId: m.userId, title: 'New Member', message: `Someone joined ${group.name}.`, type: 'info' })
    )
  );
  return member;
};

export const createInvite = async (senderId, groupId, email) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw Object.assign(new Error('Group not found.'), { statusCode: 404 });

  const isMember = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId: senderId } } });
  if (!isMember) throw Object.assign(new Error('Not a member of this group.'), { statusCode: 403 });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  const invite = await prisma.invite.create({
    data: { groupId, senderId, email, token, expiresAt, receiverId: existingUser?.id ?? null }
  });

  if (existingUser) {
    await createNotification({
      userId: existingUser.id,
      title: 'Group Invite',
      message: `You've been invited to join ${group.name}.`,
      type: 'invite'
    });
  }

  return invite;
};

export const acceptInvite = async (userId, token) => {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.status !== 'pending') throw Object.assign(new Error('Invalid or expired invite.'), { statusCode: 400 });
  if (new Date() > invite.expiresAt) throw Object.assign(new Error('Invite has expired.'), { statusCode: 400 });

  await prisma.invite.update({ where: { token }, data: { status: 'accepted', receiverId: userId } });
  return joinGroupById(userId, invite.groupId);
};
