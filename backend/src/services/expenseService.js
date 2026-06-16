import prisma from '../config/db.js';
import { createActivity } from './activityService.js';
import { createNotification } from './notificationService.js';

export const addExpense = async (userId, { groupId, amountCents, description, notes, receiptUrl, payerId, splits, categoryId }) => {
  if (!groupId || !amountCents || !payerId || !splits?.length) {
    throw Object.assign(new Error('groupId, amountCents, payerId, and splits are required.'), { statusCode: 400 });
  }

  const isMember = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
  if (!isMember) throw Object.assign(new Error('Not a member of this group.'), { statusCode: 403 });

  const expense = await prisma.expense.create({
    data: {
      groupId,
      amountCents,
      description,
      notes: notes ?? null,
      receiptUrl: receiptUrl ?? null,
      payerId,
      categoryId: categoryId ?? null,
      splits: { createMany: { data: splits.map(s => ({ userId: s.userId, amountCents: s.amountCents })) } }
    },
    include: {
      splits: true,
      payer: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } }
    }
  });

  await createActivity({ userId, groupId, type: 'expense_added', meta: { description, amountCents } });

  const members = await prisma.groupMember.findMany({ where: { groupId } });
  await Promise.all(
    members.filter(m => m.userId !== userId).map(m =>
      createNotification({
        userId: m.userId,
        title: 'New Expense',
        message: `${description} — $${(amountCents / 100).toFixed(2)} added.`,
        type: 'expense'
      })
    )
  );

  return expense;
};

export const deleteExpense = async (userId, expenseId) => {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw Object.assign(new Error('Expense not found.'), { statusCode: 404 });

  const group = await prisma.group.findUnique({ where: { id: expense.groupId } });
  if (expense.payerId !== userId && group.ownerId !== userId) {
    throw Object.assign(new Error('Not authorized.'), { statusCode: 403 });
  }

  return prisma.expense.delete({ where: { id: expenseId } });
};

export const getCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

export const createCategory = async (name, icon) => {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({ data: { name, icon } });
};
