import * as AnalyticsService from '../services/analyticsService.js';

export const monthlySpending = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getMonthlySpending(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const categorySpending = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getCategorySpending(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const settlementRate = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getSettlementRate(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const groupDebtors = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getTopDebtors(req.params.groupId);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const groupCreditors = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getTopCreditors(req.params.groupId);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const groupHealth = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getGroupHealth(req.params.groupId);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const memberComparison = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getMemberComparison(req.params.groupId);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const spendingForecast = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getSpendingForecast(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const groupComparison = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getGroupComparison(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const netBalance = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getNetBalance(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};
