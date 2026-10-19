import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartEmpty from './ChartEmpty';

export const CATEGORY_COLORS = ['#1e3a8a', '#0f766e', '#b45309', '#7c3aed', '#be123c', '#0369a1', '#4d7c0f', '#64748b'];

/** Donut plus a text legend with amounts and percentages (colour is never the only cue). */
export default function CategoryDonut({ data, format }) {
  if (data.length === 0) return <ChartEmpty message="No expenses to show yet." />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-56 shrink-0" role="img" aria-label="Donut chart of expenses by category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="category" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [format(value), name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((entry, index) => (
          <li key={entry.category} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-700">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
              />
              {entry.category}
            </span>
            <span className="tabular-nums text-slate-600">
              {format(entry.total)} ({entry.percent.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
