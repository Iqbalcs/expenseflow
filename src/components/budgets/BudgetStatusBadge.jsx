import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const CONFIG = {
  ok: { label: 'On track', icon: CheckCircle2, className: 'bg-green-50 text-green-800' },
  warning: { label: 'Approaching limit', icon: AlertTriangle, className: 'bg-amber-50 text-amber-800' },
  exceeded: { label: 'Over budget', icon: XCircle, className: 'bg-red-50 text-red-800' },
};

/** Icon + text, so the status never relies on colour alone. */
export default function BudgetStatusBadge({ state }) {
  const config = CONFIG[state];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
