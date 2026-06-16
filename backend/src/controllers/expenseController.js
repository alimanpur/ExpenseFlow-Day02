import * as ExpenseService from '../services/expenseService.js';

export const logManualExpense = async (req, res, next) => {
  try {
    const expense = await ExpenseService.addExpense(req.user.id, req.body);
    return res.status(201).json({ success: true, data: expense });
  } catch (e) { next(e); }
};

export const removeExpense = async (req, res, next) => {
  try {
    await ExpenseService.deleteExpense(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Expense deleted.' });
  } catch (e) { next(e); }
};

export const listCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseService.getCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (e) { next(e); }
};

export const addCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name required.' });
    const category = await ExpenseService.createCategory(name, icon);
    return res.status(201).json({ success: true, data: category });
  } catch (e) { next(e); }
};
