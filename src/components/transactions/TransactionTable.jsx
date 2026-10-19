import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { useMoney } from '../../hooks/useMoney';
import { formatDate } from '../../utils/formatting';

export default function TransactionTable({ transactions, onEdit, onDelete }) {
  const format = useMoney();
  const showActions = Boolean(onEdit || onDelete);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Transactions</caption>
        <thead className="border-b border-slate-200 text-xs text-slate-500">
          <tr>
            <th scope="col" className="py-3 pr-4 font-medium">Date</th>
            <th scope="col" className="py-3 pr-4 font-medium">Description</th>
            <th scope="col" className="py-3 pr-4 font-medium">Category</th>
            <th scope="col" className="py-3 pr-4 font-medium">Type</th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">Amount</th>
            {showActions && (
              <th scope="col" className="py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((t) => {
            const income = t.type === 'income';
            return (
              <tr key={t.id}>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{formatDate(t.date)}</td>
                <td className="max-w-[220px] truncate py-3 pr-4 font-medium text-slate-900" title={t.description}>
                  {t.description}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{t.category}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      income ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {income ? <ArrowDownLeft className="h-3 w-3" aria-hidden="true" /> : <ArrowUpRight className="h-3 w-3" aria-hidden="true" />}
                    {income ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums ${
                    income ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {income ? '+' : '−'}
                  {format(t.amountMinor)}
                </td>
                {showActions && (
                  <td className="whitespace-nowrap py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      aria-label={`Edit ${t.description}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t)}
                      aria-label={`Delete ${t.description}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
