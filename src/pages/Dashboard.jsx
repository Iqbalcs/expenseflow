import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, PiggyBank, Receipt, Scale, Wallet } from 'lucide-react';
import BudgetOverview from '../components/budgets/BudgetOverview';
import CategoryDonut from '../components/charts/CategoryDonut';
import IncomeExpenseBar from '../components/charts/IncomeExpenseBar';
import SpendingTrendLine from '../components/charts/SpendingTrendLine';
import TopCategoriesBar from '../components/charts/TopCategoriesBar';
import SummaryCard from '../components/dashboard/SummaryCard';
import TransactionTable from '../components/transactions/TransactionTable';
import Button, { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { useExpenses } from '../hooks/useExpenses';
import { useMoney } from '../hooks/useMoney';
import { categoryTotals, getBudgetStatus, getTotals, monthlySeries, sortTransactions, trendSeries } from '../utils/calculations';
import { addDays, addMonths, currentMonthKey, monthLabel, monthsBetween, todayString } from '../utils/dates';

export default function Dashboard() {
  const { transactions, budgets, loadDemoData } = useExpenses();
  const format = useMoney();
  const month = currentMonthKey();
  const today = todayString();
  const budget = budgets[month];

  const totals = useMemo(() => getTotals(transactions), [transactions]);
  const status = useMemo(() => getBudgetStatus(transactions, month, budget?.limitMinor), [transactions, month, budget]);
  const monthly = useMemo(
    () => monthlySeries(transactions, monthsBetween(addMonths(month, -5), month)),
    [transactions, month],
  );
  const categories = useMemo(() => categoryTotals(transactions), [transactions]);
  const trend = useMemo(() => trendSeries(transactions, addDays(today, -29), today).data, [transactions, today]);
  const recent = useMemo(() => sortTransactions(transactions, 'date', 'desc').slice(0, 5), [transactions]);

  if (transactions.length === 0) {
    return (
      <>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Add your first income or expense to see totals and charts here. Everything stays in this browser."
        >
          <Link to="/transactions?new=1" className={buttonStyles('primary')}>
            Add transaction
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              loadDemoData();
              toast.success('Demo data loaded');
            }}
          >
            Load demo data
          </Button>
        </EmptyState>
      </>
    );
  }

  const remainingCard =
    status.state === 'none'
      ? { value: 'Not set', hint: <Link to="/budgets" className="font-medium text-primary-700 underline">Set a monthly budget</Link>, tone: 'neutral' }
      : {
          value: format(status.remaining),
          hint: status.remaining < 0 ? 'Over budget this month' : `of ${format(status.limit)} budget`,
          tone: status.remaining < 0 ? 'expense' : 'income',
        };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total income" value={format(totals.income)} icon={ArrowDownLeft} tone="income" />
        <SummaryCard label="Total expenses" value={format(totals.expense)} icon={ArrowUpRight} tone="expense" />
        <SummaryCard label="Net balance" value={format(totals.net)} icon={Scale} tone={totals.net < 0 ? 'expense' : 'neutral'} />
        <SummaryCard label={`${monthLabel(month, true)} expenses`} value={format(status.spent)} icon={CalendarDays} />
        <SummaryCard label="Budget remaining" value={remainingCard.value} hint={remainingCard.hint} icon={PiggyBank} tone={remainingCard.tone} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Income vs expenses" subtitle="Last six months">
          <IncomeExpenseBar data={monthly} format={format} />
        </Card>
        <Card title="Spending trend" subtitle="Daily expenses, last 30 days">
          <SpendingTrendLine data={trend} format={format} />
        </Card>
        <Card title="Expenses by category" subtitle="All time">
          <CategoryDonut data={categories} format={format} />
        </Card>
        <Card title="Top spending categories" subtitle="All time">
          <TopCategoriesBar data={categories.slice(0, 5)} format={format} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Recent transactions"
          className="lg:col-span-2"
          action={
            <Link to="/transactions" className="text-sm font-medium text-primary-700 underline">
              View all
            </Link>
          }
        >
          <TransactionTable transactions={recent} />
        </Card>
        <Card title={`${monthLabel(month, true)} budget`}>
          {status.state === 'none' ? (
            <div className="space-y-3 text-sm text-slate-600">
              <p>You haven't set a budget for this month.</p>
              <Link to="/budgets" className={buttonStyles('secondary', 'sm')}>
                <Receipt className="h-4 w-4" aria-hidden="true" />
                Set budget
              </Link>
            </div>
          ) : (
            <BudgetOverview status={status} format={format} monthName={monthLabel(month, true)} />
          )}
        </Card>
      </div>
    </>
  );
}
