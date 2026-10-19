import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, Download, Hash, Scale } from 'lucide-react';
import CategoryDonut from '../components/charts/CategoryDonut';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar';
import SpendingTrendLine from '../components/charts/SpendingTrendLine';
import SummaryCard from '../components/dashboard/SummaryCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { inputClass } from '../components/ui/Field';
import { ALL_CATEGORIES } from '../data/categories';
import { useExpenses } from '../hooks/useExpenses';
import { useMoney } from '../hooks/useMoney';
import { categoryTotals, filterTransactions, getTotals, monthlySeries, sortTransactions, trendSeries } from '../utils/calculations';
import { buildCsv, downloadCsv } from '../utils/csvExport';
import { addMonths, currentMonthKey, firstDayOfMonth, lastDayOfMonth, monthKey, monthLabel, monthsBetween, todayString } from '../utils/dates';

const presets = () => {
  const now = currentMonthKey();
  const year = now.slice(0, 4);
  return [
    { label: 'This month', from: firstDayOfMonth(now), to: lastDayOfMonth(now) },
    { label: 'Last 3 months', from: firstDayOfMonth(addMonths(now, -2)), to: lastDayOfMonth(now) },
    { label: 'Last 6 months', from: firstDayOfMonth(addMonths(now, -5)), to: lastDayOfMonth(now) },
    { label: 'This year', from: `${year}-01-01`, to: `${year}-12-31` },
    { label: 'All time', from: '', to: '' },
  ];
};

export default function Reports() {
  const { transactions } = useExpenses();
  const format = useMoney();
  const initial = presets()[2];
  const [range, setRange] = useState({ from: initial.from, to: initial.to });
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const invalidRange = Boolean(range.from && range.to && range.from > range.to);

  const filtered = useMemo(
    () => (invalidRange ? [] : filterTransactions(transactions, { type, category, from: range.from, to: range.to })),
    [transactions, type, category, range, invalidRange],
  );

  // Effective bounds so "All time" still produces sensible charts.
  const dates = transactions.map((t) => t.date).sort();
  const today = todayString();
  const effFrom = range.from || dates[0] || today;
  const effTo = range.to || (dates.length && dates[dates.length - 1] > today ? dates[dates.length - 1] : today);

  const totals = useMemo(() => getTotals(filtered), [filtered]);
  const months = useMemo(
    () => (invalidRange ? [] : monthsBetween(monthKey(effFrom), monthKey(effTo))),
    [effFrom, effTo, invalidRange],
  );
  const monthly = useMemo(() => monthlySeries(filtered, months), [filtered, months]);
  const categories = useMemo(() => categoryTotals(filtered), [filtered]);
  const trend = useMemo(() => trendSeries(filtered, effFrom, effTo), [filtered, effFrom, effTo]);

  const handleExport = () => {
    const name = `expenseflow-report-${range.from || 'start'}-to-${range.to || 'today'}.csv`;
    downloadCsv(name, buildCsv(sortTransactions(filtered, 'date', 'desc')));
    toast.success(`Exported ${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`);
  };

  const setPreset = (preset) => setRange({ from: preset.from, to: preset.to });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <Button onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download CSV
        </Button>
      </div>

      <Card title="Filters" subtitle="Charts, tables and the CSV export all use these filters.">
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Quick date ranges">
          {presets().map((preset) => (
            <Button key={preset.label} variant="secondary" size="sm" onClick={() => setPreset(preset)}>
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="report-from" className="mb-1 block text-sm font-medium text-slate-700">From</label>
            <input id="report-from" type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={inputClass(invalidRange)} />
          </div>
          <div>
            <label htmlFor="report-to" className="mb-1 block text-sm font-medium text-slate-700">To</label>
            <input id="report-to" type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={inputClass(invalidRange)} />
          </div>
          <div>
            <label htmlFor="report-type" className="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <select id="report-type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass(false)}>
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label htmlFor="report-category" className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select id="report-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass(false)}>
              <option value="all">All categories</option>
              {ALL_CATEGORIES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        {invalidRange && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            The start date must be on or before the end date.
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Income" value={format(totals.income)} icon={ArrowDownLeft} tone="income" />
        <SummaryCard label="Expenses" value={format(totals.expense)} icon={ArrowUpRight} tone="expense" />
        <SummaryCard label="Net" value={format(totals.net)} icon={Scale} tone={totals.net < 0 ? 'expense' : 'neutral'} />
        <SummaryCard label="Transactions" value={String(filtered.length)} icon={Hash} />
      </div>

      <Card title="Income vs expenses by month">
        <IncomeExpenseBar data={monthly} format={format} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Spending by category">
          <CategoryDonut data={categories} format={format} />
        </Card>
        <Card title="Spending trend" subtitle={trend.granularity === 'day' ? 'Daily expenses' : 'Monthly expenses'}>
          <SpendingTrendLine data={trend.data} format={format} />
        </Card>
      </div>

      <Card title="Monthly summary">
        {monthly.length === 0 ? (
          <p className="text-sm text-slate-600">No months to show for this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">Monthly financial summary</caption>
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="py-3 pr-4 font-medium">Month</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Income</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Expenses</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Net</th>
                  <th scope="col" className="py-3 text-right font-medium">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...monthly].reverse().map((row) => {
                  const net = row.income - row.expense;
                  return (
                    <tr key={row.month}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{monthLabel(row.month, true)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-green-700">{format(row.income)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-red-700">{format(row.expense)}</td>
                      <td className={`py-3 pr-4 text-right font-medium tabular-nums ${net < 0 ? 'text-red-700' : 'text-slate-900'}`}>{format(net)}</td>
                      <td className="py-3 text-right tabular-nums">{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
