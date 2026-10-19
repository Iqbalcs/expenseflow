import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact } from '../../utils/money';
import ChartEmpty from './ChartEmpty';

export default function IncomeExpenseBar({ data, format }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  if (!hasData) return <ChartEmpty />;
  return (
    <div className="h-72 w-full" role="img" aria-label="Bar chart comparing monthly income and expenses">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={(value, name) => [format(value), name]} />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#15803d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#b91c1c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
