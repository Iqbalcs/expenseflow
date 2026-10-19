export const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Education',
  'Healthcare',
  'Entertainment',
  'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Business', 'Gifts', 'Other Income'];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const categoriesFor = (type) => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);
