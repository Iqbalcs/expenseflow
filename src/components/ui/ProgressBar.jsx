const COLORS = { ok: 'bg-primary-600', warning: 'bg-amber-500', exceeded: 'bg-red-600', none: 'bg-slate-300' };

export default function ProgressBar({ ratio, state = 'ok', label }) {
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div className={`h-full rounded-full transition-all ${COLORS[state]}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
