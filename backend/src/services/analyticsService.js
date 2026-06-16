import prisma from '../config/db.js';
import { calculateGroupBalances } from './groupService.js';

export const getMonthlySpending = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: { group: { members: { some: { userId } } } },
    select: { amountCents: true, createdAt: true }
  });

  const monthly = {};
  expenses.forEach(e => {
    const key = e.createdAt.toISOString().slice(0, 7);
    monthly[key] = (monthly[key] || 0) + e.amountCents;
  });

  return Object.entries(monthly)
    .map(([month, amountCents]) => ({ month, amountCents }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
};

export const getCategorySpending = async (userId) => {
  const expenses = await prisma.expense.findMany({
    where: { group: { members: { some: { userId } } } },
    include: { category: { select: { name: true } } }
  });

  const cats = {};
  expenses.forEach(e => {
    const name = e.category?.name ?? 'Uncategorized';
    cats[name] = (cats[name] || 0) + e.amountCents;
  });

  const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(cats).map(([category, amountCents]) => ({
    category,
    amountCents,
    percentage: Math.round((amountCents / total) * 100)
  })).sort((a, b) => b.amountCents - a.amountCents);
};

export const getSettlementRate = async (userId) => {
  const [total, verified] = await Promise.all([
    prisma.settlement.count({ where: { OR: [{ payerId: userId }, { receiverId: userId }] } }),
    prisma.settlement.count({ where: { OR: [{ payerId: userId }, { receiverId: userId }], verified: true } })
  ]);
  return { total, verified, rate: total > 0 ? Math.round((verified / total) * 100) : 100 };
};

export const getTopDebtors = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      expenses: { include: { splits: true } },
      settlements: true
    }
  });
  if (!group) return [];

  const balances = calculateGroupBalances(group.members, group.expenses, group.settlements);
  return group.members
    .map(m => ({ userId: m.userId, name: m.user.name, balanceCents: balances[m.userId] || 0 }))
    .filter(m => m.balanceCents < 0)
    .sort((a, b) => a.balanceCents - b.balanceCents);
};

export const getTopCreditors = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      expenses: { include: { splits: true } },
      settlements: true
    }
  });
  if (!group) return [];

  const balances = calculateGroupBalances(group.members, group.expenses, group.settlements);
  return group.members
    .map(m => ({ userId: m.userId, name: m.user.name, balanceCents: balances[m.userId] || 0 }))
    .filter(m => m.balanceCents > 0)
    .sort((a, b) => b.balanceCents - a.balanceCents);
};

export const getGroupHealth = async (groupId) => {
  const [expenseCount, settlementCount, verifiedCount, memberCount] = await Promise.all([
    prisma.expense.count({ where: { groupId } }),
    prisma.settlement.count({ where: { groupId } }),
    prisma.settlement.count({ where: { groupId, verified: true } }),
    prisma.groupMember.count({ where: { groupId } })
  ]);

  return {
    expenseCount,
    memberCount,
    settlementCount,
    verifiedCount,
    settlementRate: settlementCount > 0 ? Math.round((verifiedCount / settlementCount) * 100) : 100
  };
};

export const getMemberComparison = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      expenses: { include: { splits: true } },
    }
  });
  if (!group) return [];

  const paid = {};
  const owed = {};
  group.members.forEach(m => { paid[m.userId] = 0; owed[m.userId] = 0; });

  group.expenses.forEach(exp => {
    paid[exp.payerId] = (paid[exp.payerId] || 0) + exp.amountCents;
    exp.splits.forEach(split => {
      owed[split.userId] = (owed[split.userId] || 0) + split.amountCents;
    });
  });

  return group.members.map(m => ({
    userId: m.userId,
    name: m.user.name,
    paidCents: paid[m.userId] || 0,
    owedCents: owed[m.userId] || 0,
    netCents: (paid[m.userId] || 0) - (owed[m.userId] || 0)
  }));
};

export const getSpendingForecast = async (userId) => {
  const monthly = await getMonthlySpending(userId);
  if (monthly.length < 2) return { forecast: [], trend: 'insufficient_data' };

  // Simple linear regression on last 6 months
  const recent = monthly.slice(-6);
  const n = recent.length;
  const xMean = (n - 1) / 2;
  const yMean = recent.reduce((a, c) => a + c.amountCents, 0) / n;

  let num = 0, den = 0;
  recent.forEach((d, i) => {
    num += (i - xMean) * (d.amountCents - yMean);
    den += (i - xMean) ** 2;
  });
  const slope = den !== 0 ? num / den : 0;

  // Project next 3 months
  const lastDate = new Date(recent[recent.length - 1].month + '-01');
  const forecast = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + i + 1);
    const month = d.toISOString().slice(0, 7);
    const projected = Math.max(0, Math.round(yMean + slope * (n + i - xMean)));
    return { month, amountCents: projected, forecast: true };
  });

  const trend = slope > 500 ? 'increasing' : slope < -500 ? 'decreasing' : 'stable';
  return { forecast, trend, slope: Math.round(slope), baselineCents: Math.round(yMean) };
};

export const getGroupComparison = async (userId) => {
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      expenses: { select: { amountCents: true } },
      _count: { select: { members: true } }
    }
  });

  return groups.map(g => ({
    groupId: g.id,
    name: g.name,
    totalCents: g.expenses.reduce((a, e) => a + e.amountCents, 0),
    expenseCount: g.expenses.length,
    memberCount: g._count.members
  })).sort((a, b) => b.totalCents - a.totalCents);
};

export const getNetBalance = async (userId) => {
  const [groups, pendingSettlements] = await Promise.all([
    prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: true,
        expenses: { include: { splits: true } },
        settlements: true
      }
    }),
    prisma.settlement.findMany({
      where: { OR: [{ payerId: userId }, { receiverId: userId }], verified: false },
      include: {
        payer: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } }
      }
    })
  ]);

  let totalOwedToMe = 0;
  let totalIOwe = 0;

  groups.forEach(g => {
    const balances = calculateGroupBalances(g.members, g.expenses, g.settlements);
    const myBal = balances[userId] || 0;
    if (myBal > 0) totalOwedToMe += myBal;
    else totalIOwe += Math.abs(myBal);
  });

  return {
    totalOwedToMe,
    totalIOwe,
    net: totalOwedToMe - totalIOwe,
    pendingSettlements
  };
};
