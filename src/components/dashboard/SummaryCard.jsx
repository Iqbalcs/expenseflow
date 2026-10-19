const TONES = {
  neutral: { value: 'text-slate-900', icon: 'bg-primary-50 text-primary-600' },
  income: { value: 'text-green-700', icon: 'bg-green-50 text-green-700' },
  expense: { value: 'text-red-700', icon: 'bg-red-50 text-red-700' },
};

export default function SummaryCard({ label, value, hint, icon: Icon, tone = 'neutral' }) {
  const styles = TONES[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className={`mt-1 break-words text-2xl font-semibold tabular-nums ${styles.value}`}>{value}</p>
      {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
