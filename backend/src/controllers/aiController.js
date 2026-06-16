import * as AIService from '../services/aiService.js';

export const parseExpense = async (req, res, next) => {
  try {
    const result = await AIService.aiParseOnly(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (e) { next(e); }
};

export const triggerAiQuickAdd = async (req, res, next) => {
  try {
    const result = await AIService.aiParseAndCreate(req.user.id, req.body);
    return res.status(201).json({ success: true, data: result.expense, aiInferred: true, parsed: result.parsed });
  } catch (e) { next(e); }
};
