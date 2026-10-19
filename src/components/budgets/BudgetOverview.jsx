import { formatPercent } from '../../utils/formatting';
import ProgressBar from '../ui/ProgressBar';
import BudgetStatusBadge from './BudgetStatusBadge';

/** Spent vs. limit for one month. `status` comes from getBudgetStatus(). */
export default function BudgetOverview({ status, format, monthName }) {
  const over = status.remaining < 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          {formatPercent(status.ratio)} of the {monthName} budget used
        </p>
        <BudgetStatusBadge state={status.state} />
      </div>
      <ProgressBar ratio={status.ratio} state={status.state} label={`${monthName} budget used`} />
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Spent</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{format(status.spent)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Budget</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{format(status.limit)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">{over ? 'Over by' : 'Remaining'}</dt>
          <dd className={`font-semibold tabular-nums ${over ? 'text-red-700' : 'text-green-700'}`}>
            {format(Math.abs(status.remaining))}
          </dd>
        </div>
      </dl>
    </div>
  );
}
