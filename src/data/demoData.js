import { addMonths, daysInMonth } from '../utils/dates';

// [day, type, category, description, base amount in whole PKR]
const MONTHLY_TEMPLATE = [
  [1, 'income', 'Salary', 'Monthly salary', 120000],
  [3, 'expense', 'Bills & Utilities', 'Electricity bill', 9500],
  [4, 'expense', 'Bills & Utilities', 'Internet bill', 3500],
  [5, 'expense', 'Food', 'Weekly groceries', 11000],
  [8, 'expense', 'Transportation', 'Fuel', 6000],
  [12, 'expense', 'Food', 'Dinner out', 4200],
  [14, 'expense', 'Shopping', 'Clothing', 8500],
  [18, 'expense', 'Education', 'Online course', 5000],
  [20, 'income', 'Freelancing', 'Website project', 35000],
  [22, 'expense', 'Entertainment', 'Movie night', 2500],
  [25, 'expense', 'Healthcare', 'Pharmacy', 3000],
  [27, 'expense', 'Other', 'Miscellaneous', 2000],
];

/**
 * Builds fictional, deterministic sample data for the last six months.
 * Entries dated after `today` are skipped so nothing appears in the future.
 */
export function buildDemoData(today) {
  const thisMonth = today.slice(0, 7);
  const transactions = [];
  const budgets = {};

  for (let offset = 5; offset >= 0; offset -= 1) {
    const month = addMonths(thisMonth, -offset);
    budgets[month] = { limitMinor: 6_000_000 }; // Rs 60,000

    MONTHLY_TEMPLATE.forEach(([day, type, category, description, base], index) => {
      // Freelance income only in some months, for variety.
      if (category === 'Freelancing' && offset % 2 === 1) return;
      const date = `${month}-${String(Math.min(day, daysInMonth(month))).padStart(2, '0')}`;
      if (date > today) return;
      const multiplier = type === 'expense' ? 1 + (((offset * 7 + index * 3) % 5) - 2) * 0.04 : 1;
      const pkr = Math.round((base * multiplier) / 50) * 50;
      transactions.push({
        id: `demo-${month}-${index}`,
        type,
        amountMinor: pkr * 100,
        category,
        description,
        date,
        createdAt: `${date}T09:00:00.000Z`,
      });
    });
  }
  return { transactions, budgets };
}

export const isDemoTransaction = (t) => t.id.startsWith('demo-');
