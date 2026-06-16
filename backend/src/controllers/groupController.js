import * as GroupService from '../services/groupService.js';

export const createGroup = async (req, res, next) => {
  try {
    const group = await GroupService.createGroup(req.user.id, req.body);
    return res.status(201).json({ success: true, data: group });
  } catch (e) { next(e); }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = await GroupService.updateGroup(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, data: group });
  } catch (e) { next(e); }
};

export const deleteGroup = async (req, res, next) => {
  try {
    await GroupService.deleteGroup(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Group deleted.' });
  } catch (e) { next(e); }
};

export const listGroups = async (req, res, next) => {
  try {
    const groups = await GroupService.listUserGroups(req.user.id);
    return res.status(200).json({ success: true, data: groups });
  } catch (e) { next(e); }
};

export const getGroupDashboardLedger = async (req, res, next) => {
  try {
    const data = await GroupService.getGroupLedger(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ success: false, message: 'Group not found.' });
    return res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

export const joinGroup = async (req, res, next) => {
  try {
    const member = await GroupService.joinGroupById(req.user.id, req.body.groupId);
    return res.status(200).json({ success: true, data: member });
  } catch (e) { next(e); }
};

export const removeMember = async (req, res, next) => {
  try {
    await GroupService.removeMember(req.user.id, req.params.id, req.params.userId);
    return res.status(200).json({ success: true, message: 'Member removed.' });
  } catch (e) { next(e); }
};

export const inviteMember = async (req, res, next) => {
  try {
    const invite = await GroupService.createInvite(req.user.id, req.params.id, req.body.email);
    return res.status(201).json({ success: true, data: invite });
  } catch (e) { next(e); }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const member = await GroupService.acceptInvite(req.user.id, req.params.token);
    return res.status(200).json({ success: true, data: member });
  } catch (e) { next(e); }
};
