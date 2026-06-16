import prisma from './db.js';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️' },
  { name: 'Groceries', icon: '🛒' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Accommodation', icon: '🏠' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Sports & Fitness', icon: '🏋️' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '📌' },
];

export const seedCategories = async () => {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
};
