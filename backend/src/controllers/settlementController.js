import * as SettlementService from '../services/settlementService.js';

export const recordSettlement = async (req, res, next) => {
  try {
    const settlement = await SettlementService.recordSettlement(req.user.id, req.body);
    return res.status(201).json({ success: true, data: settlement });
  } catch (e) { next(e); }
};

export const verifySettlement = async (req, res, next) => {
  try {
    const settlement = await SettlementService.verifySettlement(req.user.id, req.params.id);
    return res.status(200).json({ success: true, data: settlement });
  } catch (e) { next(e); }
};

export const listGroupSettlements = async (req, res, next) => {
  try {
    const settlements = await SettlementService.listGroupSettlements(req.params.groupId);
    return res.status(200).json({ success: true, data: settlements });
  } catch (e) { next(e); }
};

export const listMySettlements = async (req, res, next) => {
  try {
    const settlements = await SettlementService.listUserSettlements(req.user.id);
    return res.status(200).json({ success: true, data: settlements });
  } catch (e) { next(e); }
};
