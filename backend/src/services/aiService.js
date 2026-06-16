import prisma from '../config/db.js';
import { parseAiQuickAddPrompt } from '../config/openRouter.js';
import { addExpense } from './expenseService.js';

export const aiParseAndCreate = async (userId, { groupId, promptText }) => {
  if (!groupId || !promptText?.trim()) {
    throw Object.assign(new Error('groupId and promptText are required.'), { statusCode: 400 });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true }
  });

  if (!members.length) {
    throw Object.assign(new Error('No members found in this group.'), { statusCode: 404 });
  }

  const parsed = await parseAiQuickAddPrompt(promptText, members);

  const expense = await addExpense(userId, {
    groupId,
    amountCents: parsed.amountCents,
    description: parsed.description,
    payerId: parsed.payerId,
    splits: parsed.splits
  });

  return { expense, parsed };
};

export const aiParseOnly = async ({ groupId, promptText }) => {
  if (!groupId || !promptText?.trim()) {
    throw Object.assign(new Error('groupId and promptText are required.'), { statusCode: 400 });
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true }
  });

  if (!members.length) {
    throw Object.assign(new Error('No members found in this group.'), { statusCode: 404 });
  }

  return parseAiQuickAddPrompt(promptText, members);
};
