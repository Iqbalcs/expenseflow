import { ALL_CATEGORIES } from '../../data/categories';
import Button from '../ui/Button';
import { inputClass } from '../ui/Field';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
];

function Labeled({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function TransactionFilters({ filters, onChange, onReset, hasActiveFilters }) {
  const badRange = filters.from && filters.to && filters.from > filters.to;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Labeled id="filter-search" label="Search">
        <input
          id="filter-search"
          type="search"
          placeholder="Search descriptions"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className={inputClass(false)}
        />
      </Labeled>
      <Labeled id="filter-type" label="Type">
        <select id="filter-type" value={filters.type} onChange={(e) => onChange('type', e.target.value)} className={inputClass(false)}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </Labeled>
      <Labeled id="filter-category" label="Category">
        <select id="filter-category" value={filters.category} onChange={(e) => onChange('category', e.target.value)} className={inputClass(false)}>
          <option value="all">All categories</option>
          {ALL_CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Labeled>
      <Labeled id="filter-sort" label="Sort by">
        <select id="filter-sort" value={filters.sort} onChange={(e) => onChange('sort', e.target.value)} className={inputClass(false)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Labeled>
      <Labeled id="filter-from" label="From">
        <input id="filter-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => onChange('from', e.target.value)} className={inputClass(badRange)} />
      </Labeled>
      <Labeled id="filter-to" label="To">
        <input id="filter-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => onChange('to', e.target.value)} className={inputClass(badRange)} />
      </Labeled>
      <div className="flex items-end sm:col-span-2">
        <Button variant="secondary" onClick={onReset} disabled={!hasActiveFilters && filters.sort === 'date-desc'}>
          Reset filters
        </Button>
        {badRange && (
          <p role="alert" className="ml-3 text-sm text-red-700">
            The start date must be on or before the end date.
          </p>
        )}
      </div>
    </div>
  );
}
