import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact } from '../../utils/money';
import ChartEmpty from './ChartEmpty';

export default function TopCategoriesBar({ data, format }) {
  if (data.length === 0) return <ChartEmpty message="No expenses to show yet." />;
  return (
    <div className="h-72 w-full" role="img" aria-label="Horizontal bar chart of top spending categories">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={formatCompact} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} tickLine={false} width={120} />
          <Tooltip formatter={(value) => [format(value), 'Spent']} />
          <Bar dataKey="total" name="Spent" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
