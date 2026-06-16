import * as ActivityService from '../services/activityService.js';

export const groupFeed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await ActivityService.getGroupActivity(req.params.groupId, limit);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const userFeed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const data = await ActivityService.getUserActivity(req.user.id, limit);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};
