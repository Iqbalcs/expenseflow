import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact } from '../../utils/money';
import ChartEmpty from './ChartEmpty';

export default function SpendingTrendLine({ data, format }) {
  if (!data.some((d) => d.expense > 0)) return <ChartEmpty message="No spending in this period." />;
  return (
    <div className="h-72 w-full" role="img" aria-label="Line chart of spending over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} minTickGap={24} />
          <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={(value) => [format(value), 'Expenses']} />
          <Line type="monotone" dataKey="expense" name="Expenses" stroke="#b91c1c" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
