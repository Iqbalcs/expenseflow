import { useState } from 'react';
import { toast } from 'sonner';
import { Database, Info, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { inputClass } from '../components/ui/Field';
import { isDemoTransaction } from '../data/demoData';
import { CURRENCIES } from '../data/constants';
import { useExpenses } from '../hooks/useExpenses';

export default function Settings() {
  const { transactions, budgets, settings, setCurrency, loadDemoData, clearAllData } = useExpenses();
  const [confirmClear, setConfirmClear] = useState(false);
  const budgetCount = Object.keys(budgets).length;
  const demoLoaded = transactions.some(isDemoTransaction);

  const handleLoadDemo = () => {
    if (demoLoaded) {
      toast.info('Demo data is already loaded.');
      return;
    }
    loadDemoData();
    toast.success('Demo data added. Your existing data was kept.');
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Currency" subtitle="Changes how amounts are displayed. Amounts are not converted.">
          <label htmlFor="currency" className="mb-1 block text-sm font-medium text-slate-700">
            Display currency
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              toast.success(`Currency set to ${e.target.value}`);
            }}
            className={`${inputClass(false)} sm:max-w-xs`}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Card>

        <Card title="Your data" subtitle="Stored only in this browser.">
          <p className="mb-4 flex items-center gap-2 text-sm text-slate-600">
            <Database className="h-4 w-4 shrink-0" aria-hidden="true" />
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'} and {budgetCount} budget
            {budgetCount === 1 ? '' : 's'} saved.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleLoadDemo}>
              Load demo data
            </Button>
            <Button variant="danger" onClick={() => setConfirmClear(true)} disabled={transactions.length === 0 && budgetCount === 0}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear all data
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Demo data is fictional and is added alongside your own records; it never replaces them.
          </p>
        </Card>
      </div>

      <Card title="About browser storage">
        <div className="flex gap-3 text-sm text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <ul className="list-disc space-y-1 pl-4">
            <li>Data is saved in this browser on this device only. It does not sync between devices.</li>
            <li>Clearing your browser data, or using a private window, will delete it.</li>
            <li>LocalStorage is not encrypted. Don't use shared computers for sensitive records.</li>
          </ul>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        message={`This permanently deletes ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} and ${budgetCount} budget${budgetCount === 1 ? '' : 's'} from this browser. This can't be undone.`}
        confirmLabel="Clear all data"
        onConfirm={() => {
          clearAllData();
          setConfirmClear(false);
          toast.success('All data cleared');
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
