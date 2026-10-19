import { describe, expect, it } from 'vitest';
import { buildDemoData } from '../src/data/demoData';
import {
  categoryTotals,
  filterTransactions,
  getBudgetStatus,
  getTotals,
  monthlySeries,
  sortTransactions,
  trendSeries,
} from '../src/utils/calculations';
import { addDays, addMonths, diffDays, isValidDateString, lastDayOfMonth } from '../src/utils/dates';
import { toMajor, toMinor } from '../src/utils/money';
import { tx } from './helpers';

describe('money', () => {
  it('converts to integer minor units without floating-point drift', () => {
    expect(toMinor('1250.5')).toBe(125050);
    expect(toMinor('0.1') + toMinor('0.2')).toBe(30);
    expect(toMinor('1.005')).toBe(101);
    expect(toMajor(125050)).toBe(1250.5);
  });
});

describe('dates', () => {
  it('handles month and day arithmetic across boundaries', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2028-02')).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(diffDays('2026-10-01', '2026-10-31')).toBe(30);
  });
  it('validates real calendar dates', () => {
    expect(isValidDateString('2028-02-29')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });
});

const list = [
  tx('a', 'expense', 1000, '2026-02-01'),
  tx('b', 'expense', 2000, '2026-02-28'),
  tx('c', 'expense', 9999, '2026-03-01'),
  tx('d', 'expense', 500, '2026-01-31'),
  tx('e', 'income', 50000, '2026-02-15', 'Salary'),
];

describe('totals', () => {
  it('sums income and expenses separately and computes net', () => {
    expect(getTotals(list)).toEqual({ income: 50000, expense: 13499, net: 36501 });
  });
});

describe('budget status', () => {
  it('counts only expenses in the selected calendar month, including first and last days', () => {
    const status = getBudgetStatus(list, '2026-02', 3500);
    expect(status.spent).toBe(3000); // a (Feb 1) + b (Feb 28); not Jan 31, not Mar 1, not income
    expect(status.remaining).toBe(500);
  });
  it('reports ok / warning / exceeded / none', () => {
    expect(getBudgetStatus(list, '2026-02', 10000).state).toBe('ok');
    expect(getBudgetStatus(list, '2026-02', 3500).state).toBe('warning');
    expect(getBudgetStatus(list, '2026-02', 3000).state).toBe('warning'); // exactly at the limit
    expect(getBudgetStatus(list, '2026-02', 2999).state).toBe('exceeded');
    expect(getBudgetStatus(list, '2026-02', 0).state).toBe('none');
  });
  it('does not let income reduce spending', () => {
    const onlyIncome = [tx('i', 'income', 99999, '2026-02-10', 'Salary')];
    expect(getBudgetStatus(onlyIncome, '2026-02', 5000).spent).toBe(0);
  });
});

describe('filters and sorting', () => {
  it('date range is inclusive on both ends', () => {
    const ids = filterTransactions(list, { from: '2026-02-01', to: '2026-02-28' }).map((t) => t.id).sort();
    expect(ids).toEqual(['a', 'b', 'e']);
  });
  it('handles the leap-day boundary', () => {
    const leap = [tx('x', 'expense', 100, '2028-02-29'), tx('y', 'expense', 100, '2028-03-01')];
    expect(filterTransactions(leap, { to: '2028-02-29' }).map((t) => t.id)).toEqual(['x']);
  });
  it('searches descriptions case-insensitively and filters by type and category', () => {
    expect(filterTransactions(list, { search: ' B ' }).map((t) => t.id)).toEqual(['b']);
    expect(filterTransactions(list, { type: 'income' })).toHaveLength(1);
    expect(filterTransactions(list, { category: 'Salary' })).toHaveLength(1);
  });
  it('sorts by amount and date', () => {
    expect(sortTransactions(list, 'amount', 'desc')[0].id).toBe('e');
    expect(sortTransactions(list, 'date', 'asc')[0].id).toBe('d');
    expect(list[0].id).toBe('a'); // input is not mutated
  });
});

describe('series', () => {
  it('buckets by month', () => {
    const series = monthlySeries(list, ['2026-01', '2026-02', '2026-03']);
    expect(series[1]).toMatchObject({ income: 50000, expense: 3000, count: 3 });
    expect(series[2].expense).toBe(9999);
  });
  it('computes category totals from expenses only, with percentages', () => {
    const totals = categoryTotals(list);
    expect(totals).toHaveLength(1);
    expect(totals[0].category).toBe('Food');
    expect(totals[0].percent).toBeCloseTo(100);
  });
  it('uses daily points for short ranges and monthly points for long ones', () => {
    expect(trendSeries(list, '2026-02-01', '2026-02-28').data).toHaveLength(28);
    expect(trendSeries(list, '2025-10-01', '2026-03-31').granularity).toBe('month');
  });
});

describe('demo data', () => {
  it.each(['2026-10-17', '2026-03-01', '2026-01-02'])('is valid and never future-dated (today = %s)', (today) => {
    const { transactions, budgets } = buildDemoData(today);
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions.every((t) => t.date <= today && Number.isInteger(t.amountMinor) && t.amountMinor > 0)).toBe(true);
    expect(new Set(transactions.map((t) => t.id)).size).toBe(transactions.length);
    expect(Object.keys(budgets)).toHaveLength(6);
  });
});
