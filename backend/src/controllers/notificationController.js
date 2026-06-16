import * as NotificationService from '../services/notificationService.js';

export const listNotifications = async (req, res, next) => {
  try {
    const onlyUnread = req.query.unread === 'true';
    const data = await NotificationService.getUserNotifications(req.user.id, onlyUnread);
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const markRead = async (req, res, next) => {
  try {
    // req.body.ids = optional array of specific notification ids; empty = mark all
    await NotificationService.markNotificationsRead(req.user.id, req.body.ids);
    return res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (e) { next(e); }
};
