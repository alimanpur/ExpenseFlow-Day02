import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SAFE_USER = { id: true, email: true, name: true, avatarUrl: true, currency: true, language: true, settings: true, createdAt: true };

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'email, password, and name are required.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, name, password: hashed } });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) { next(e); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: SAFE_USER });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: user });
  } catch (e) { next(e); }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, email, currency, language } = req.body;
    const data = {};
    if (name) data.name = name;
    if (currency) data.currency = currency;
    if (language) data.language = language;
    if (email) {
      const conflict = await prisma.user.findUnique({ where: { email } });
      if (conflict && conflict.id !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
      data.email = email;
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: SAFE_USER });
    return res.status(200).json({ success: true, user });
  } catch (e) { next(e); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return res.status(200).json({ success: true, message: 'Password updated.' });
  } catch (e) { next(e); }
};

export const updateSettings = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { settings: req.body },
      select: SAFE_USER
    });
    return res.status(200).json({ success: true, user });
  } catch (e) { next(e); }
};

export const exportData = async (req, res, next) => {
  try {
    const [user, groups, expenses, settlements, activities] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: SAFE_USER }),
      prisma.group.findMany({ where: { members: { some: { userId: req.user.id } } }, include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } } }),
      prisma.expense.findMany({ where: { group: { members: { some: { userId: req.user.id } } } }, include: { splits: true, category: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.settlement.findMany({ where: { OR: [{ payerId: req.user.id }, { receiverId: req.user.id }] }, orderBy: { createdAt: 'desc' } }),
      prisma.activity.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    ]);

    return res.status(200).json({
      success: true,
      data: { exportedAt: new Date().toISOString(), user, groups, expenses, settlements, activities }
    });
  } catch (e) { next(e); }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password confirmation required.' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Incorrect password.' });

    // Delete in dependency order
    await prisma.activity.deleteMany({ where: { userId: req.user.id } });
    await prisma.notification.deleteMany({ where: { userId: req.user.id } });
    await prisma.invite.deleteMany({ where: { OR: [{ senderId: req.user.id }, { receiverId: req.user.id }] } });
    await prisma.settlement.deleteMany({ where: { OR: [{ payerId: req.user.id }, { receiverId: req.user.id }] } });
    await prisma.expenseSplit.deleteMany({ where: { userId: req.user.id } });
    await prisma.expense.deleteMany({ where: { payerId: req.user.id } });
    await prisma.groupMember.deleteMany({ where: { userId: req.user.id } });
    await prisma.group.deleteMany({ where: { ownerId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });

    return res.status(200).json({ success: true, message: 'Account deleted.' });
  } catch (e) { next(e); }
};
