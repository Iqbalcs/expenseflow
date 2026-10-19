import { BUDGET_WARNING_RATIO } from '../data/constants';
import { addDays, dayLabel, diffDays, monthKey, monthLabel, monthsBetween } from './dates';

/** Sum of amounts (minor units) for one transaction type. */
export const sumByType = (transactions, type) =>
  transactions.reduce((sum, t) => (t.type === type ? sum + t.amountMinor : sum), 0);

export const getTotals = (transactions) => {
  const income = sumByType(transactions, 'income');
  const expense = sumByType(transactions, 'expense');
  return { income, expense, net: income - expense };
};

export const filterByMonth = (transactions, key) => transactions.filter((t) => monthKey(t.date) === key);

/** Budget progress for one calendar month. Only expenses count; income never reduces spending. */
export const getBudgetStatus = (transactions, month, limitMinor) => {
  const spent = sumByType(filterByMonth(transactions, month), 'expense');
  if (!limitMinor) return { spent, limit: 0, remaining: null, ratio: 0, state: 'none' };
  const ratio = spent / limitMinor;
  let state = 'ok';
  if (spent > limitMinor) state = 'exceeded';
  else if (ratio >= BUDGET_WARNING_RATIO) state = 'warning';
  return { spent, limit: limitMinor, remaining: limitMinor - spent, ratio, state };
};

/** Income / expense / count per month, for the given list of "YYYY-MM" keys. */
export const monthlySeries = (transactions, months) => {
  const buckets = new Map(months.map((m) => [m, { month: m, label: monthLabel(m), income: 0, expense: 0, count: 0 }]));
  for (const t of transactions) {
    const bucket = buckets.get(monthKey(t.date));
    if (!bucket) continue;
    bucket[t.type] += t.amountMinor;
    bucket.count += 1;
  }
  return months.map((m) => buckets.get(m));
};

/** Totals per category, largest first, with each category's share of the total. */
export const categoryTotals = (transactions, type = 'expense') => {
  const totals = new Map();
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountMinor);
  }
  const grand = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total, percent: grand ? (total / grand) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);
};

/** Expense trend: daily for ranges up to ~2 months, otherwise monthly. */
export const trendSeries = (transactions, from, to) => {
  if (!from || !to || from > to) return { granularity: 'day', data: [] };
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (diffDays(from, to) <= 62) {
    const byDay = new Map();
    for (const t of expenses) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amountMinor);
    const data = [];
    for (let day = from; day <= to; day = addDays(day, 1)) {
      data.push({ key: day, label: dayLabel(day), expense: byDay.get(day) ?? 0 });
    }
    return { granularity: 'day', data };
  }
  const months = monthsBetween(monthKey(from), monthKey(to));
  const data = monthlySeries(expenses, months).map((m) => ({ key: m.month, label: m.label, expense: m.expense }));
  return { granularity: 'month', data };
};

export const filterTransactions = (
  transactions,
  { search = '', type = 'all', category = 'all', from = '', to = '' } = {},
) => {
  const query = search.trim().toLowerCase();
  return transactions.filter((t) => {
    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (query && !t.description.toLowerCase().includes(query)) return false;
    return true;
  });
};

export const sortTransactions = (transactions, sortBy = 'date', direction = 'desc') => {
  const dir = direction === 'asc' ? 1 : -1;
  return [...transactions].sort((a, b) => {
    const primary = sortBy === 'amount' ? a.amountMinor - b.amountMinor : a.date.localeCompare(b.date);
    if (primary !== 0) return primary * dir;
    return b.createdAt.localeCompare(a.createdAt);
  });
};
