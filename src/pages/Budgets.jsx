import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import BudgetOverview from '../components/budgets/BudgetOverview';
import BudgetStatusBadge from '../components/budgets/BudgetStatusBadge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Field, { inputClass } from '../components/ui/Field';
import { useExpenses } from '../hooks/useExpenses';
import { useMoney } from '../hooks/useMoney';
import { getBudgetStatus } from '../utils/calculations';
import { currentMonthKey, monthLabel } from '../utils/dates';
import { toMajor, toMinor } from '../utils/money';
import { amountSchema } from '../utils/schemas';

function BudgetForm({ month, existing, onSave, onRemove }) {
  const [amount, setAmount] = useState(existing ? toMajor(existing.limitMinor).toFixed(2) : '');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = amountSchema.safeParse(amount);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError('');
    onSave(toMinor(result.data));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label={`Spending limit for ${monthLabel(month, true)}`} htmlFor="budget-amount" error={error}>
        <input
          id="budget-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'budget-amount-error' : undefined}
          className={inputClass(error)}
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{existing ? 'Update budget' : 'Save budget'}</Button>
        {existing && (
          <Button variant="secondary" onClick={onRemove}>
            Remove budget
          </Button>
        )}
      </div>
    </form>
  );
}

export default function Budgets() {
  const { transactions, budgets, setBudget, removeBudget } = useExpenses();
  const format = useMoney();
  const [month, setMonth] = useState(currentMonthKey());
  const [confirmRemove, setConfirmRemove] = useState(false);
  const existing = budgets[month];

  const status = useMemo(() => getBudgetStatus(transactions, month, existing?.limitMinor), [transactions, month, existing]);
  const history = useMemo(
    () =>
      Object.entries(budgets)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, entry]) => ({ month: key, ...getBudgetStatus(transactions, key, entry.limitMinor) })),
    [transactions, budgets],
  );

  const handleSave = (limitMinor) => {
    setBudget(month, limitMinor);
    toast.success(existing ? 'Budget updated' : 'Budget saved');
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Monthly budget" subtitle="Only expenses count toward the budget. Income never reduces it.">
          <div className="mb-4">
            <label htmlFor="budget-month" className="mb-1 block text-sm font-medium text-slate-700">
              Month
            </label>
            <input
              id="budget-month"
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className={`${inputClass(false)} sm:max-w-xs`}
            />
          </div>
          <BudgetForm key={month} month={month} existing={existing} onSave={handleSave} onRemove={() => setConfirmRemove(true)} />
        </Card>

        <Card title={`${monthLabel(month, true)} progress`}>
          {status.state === 'none' ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                No budget set for {monthLabel(month, true)}. Expenses so far:{' '}
                <strong className="text-slate-900">{format(status.spent)}</strong>.
              </p>
              <p>Enter a limit to track your remaining budget.</p>
            </div>
          ) : (
            <BudgetOverview status={status} format={format} monthName={monthLabel(month, true)} />
          )}
        </Card>
      </div>

      <Card title="All budgets">
        {history.length === 0 ? (
          <p className="text-sm text-slate-600">Budgets you set will be listed here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Budgets by month</caption>
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="py-3 pr-4 font-medium">Month</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Budget</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Spent</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Remaining</th>
                  <th scope="col" className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((row) => (
                  <tr key={row.month}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{monthLabel(row.month, true)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{format(row.limit)}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{format(row.spent)}</td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${row.remaining < 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {format(row.remaining)}
                    </td>
                    <td className="py-3">
                      <BudgetStatusBadge state={row.state} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmRemove}
        title="Remove this budget?"
        message={`The ${monthLabel(month, true)} budget will be removed. Your transactions are not affected.`}
        confirmLabel="Remove budget"
        onConfirm={() => {
          removeBudget(month);
          setConfirmRemove(false);
          toast.success('Budget removed');
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}
