# ExpenseFlow

A private, browser-based **expense tracker and analytics dashboard**. Track income and expenses, set monthly budgets, explore spending with interactive charts, and export filtered reports to CSV. There is no backend: everything is stored in your browser's LocalStorage.

> **Screenshots**
>
> _Add screenshots here after running the app (e.g. `docs/dashboard.png`, `docs/transactions.png`, `docs/reports.png`, mobile view)._

## Features

- **Dashboard** with five KPI cards (total income, total expenses, net balance, this month's expenses, budget remaining), four Recharts visualisations (income vs expenses bar, category donut, spending trend line, top categories horizontal bar), recent transactions, and a budget overview.
- **Transactions**: add, edit and delete (with confirmation); search by description; filter by type, category and date range; sort by date or amount; pagination; friendly empty states.
- **Budgets**: set, update or remove a spending limit for any month; progress bar; remaining amount; "approaching limit" (80%+) and "over budget" states. Only expenses count; income never reduces spending.
- **Reports**: date-range presets, type and category filters, monthly summary table, charts, and a **CSV download that reflects the selected filters**.
- **Settings**: display currency (PKR by default), explicit **Load Demo Data** (never overwrites your data), **Clear All Data** with confirmation.
- **Responsive & accessible**: sidebar on desktop, drawer on mobile, skip link, labelled form fields with `aria-describedby` errors, focus-trapped dialogs, visible focus rings, status shown with icon + text (not colour alone).

## Tech stack

React 18 · Vite · JavaScript (ES2022) · Tailwind CSS v4 · React Router · Recharts · React Hook Form + Zod · date-fns · Lucide · Sonner · Vitest + React Testing Library

## Getting started

Requires **Node.js 20+**.

```bash
npm install
npm run dev        # start the dev server
npm test           # run the test suite once
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

Then open the URL Vite prints (usually http://localhost:5173) and use **Settings → Load demo data** to explore with fictional data.

## Project structure

```text
src/
├── components/
│   ├── layout/        AppLayout (sidebar, mobile drawer, header)
│   ├── ui/            Button, Card, Modal, ConfirmDialog, Field, EmptyState, ProgressBar
│   ├── dashboard/     SummaryCard
│   ├── transactions/  TransactionForm, TransactionTable, TransactionFilters, Pagination
│   ├── budgets/       BudgetOverview, BudgetStatusBadge
│   └── charts/        IncomeExpenseBar, CategoryDonut, SpendingTrendLine, TopCategoriesBar
├── pages/             Dashboard, Transactions, Budgets, Reports, Settings, NotFound
├── context/           ExpenseContext (state via useReducer + persistence effects)
├── hooks/             useExpenses, useMoney, useTransactionFilters
├── services/          storage.js (validated LocalStorage access)
├── utils/             calculations, money, dates, formatting, schemas, csvExport
└── data/              categories, constants, demoData
tests/                 unit tests + page-level tests
```

## Key design decisions

| Decision | Why |
|---|---|
| **Transactions are the single source of truth.** Totals, budgets and chart data are derived (`utils/calculations.js`), never stored. | Edits and deletes refresh every number automatically; no stale copies. |
| **Money is stored as integer minor units** (paisa). | Avoids floating-point errors such as `0.1 + 0.2`. Conversion lives in `utils/money.js`. |
| **Dates are `YYYY-MM-DD` strings; months are `YYYY-MM` keys.** | No timezone drift at month boundaries; ISO strings compare correctly. |
| **Context + `useReducer`** instead of Redux. | Small shared state; the reducer never mutates. |
| **Zod validates both forms and stored data.** | One definition of "a valid transaction" used at the form and at load time. |
| **Corrupt storage is backed up, not discarded.** Valid records are kept; only broken ones are skipped, with a toast. | "Never silently discard valid user data." |
| **CSV cells are escaped and formula-neutralised.** | Commas, quotes and newlines are handled; `=`, `+`, `-`, `@` prefixes can't run as spreadsheet formulas. |

### Data models

```js
// Transaction
{ id, type: 'income' | 'expense', amountMinor: 125050, category, description, date: '2026-10-17', createdAt }

// Budgets, keyed by month
{ '2026-10': { limitMinor: 6000000 } }

// Settings
{ currency: 'PKR' }
```

LocalStorage keys: `expenseflow_transactions_v1`, `expenseflow_budgets_v1`, `expenseflow_settings_v1`.

## Data storage: what to know

- Data lives **only in this browser on this device**. It does not sync between devices or browsers.
- Clearing browser data, or using a private/incognito window, **deletes it**.
- LocalStorage is **not encrypted**. It keeps data private from the website and other users of the app, not from someone with access to the browser profile.
- Storage is limited (typically ~5 MB), and the app warns you if a save fails.

## Testing

`npm test` runs Vitest with React Testing Library. Coverage includes:

- creating, editing and deleting transactions (including the delete confirmation and cancel path)
- validation errors (empty form, zero amount, category/type mismatch, impossible dates)
- LocalStorage persistence, remount, malformed JSON, wrong shape, partly-invalid records, write failures
- income, expense, net and category calculations
- monthly budget calculations, including first/last day of month and "income doesn't reduce spending"
- inclusive date-range filters and the leap day
- CSV quoting, formula neutralising and amount formatting

## Deployment

```bash
npm run build   # outputs dist/
```

Deploy `dist/` to Netlify or Vercel (SPA fallback is automatic). For GitHub Pages, set `base` in `vite.config.js` and use `HashRouter` (or add a `404.html` redirect), because the app uses client-side routing.

## Limitations

- Display-only currency setting (no conversion).
- No custom categories in the MVP.
- No user accounts or cloud sync by design.

## Resume bullets

- Built **ExpenseFlow**, a responsive React 18 + Vite expense tracker and analytics dashboard with full transaction CRUD, monthly budgets, and CSV reporting, persisted entirely client-side via validated LocalStorage.
- Designed a derived-state architecture (Context + `useReducer`, integer-minor-unit money, string-based calendar dates) so dashboard KPIs and four Recharts visualisations stay consistent after every edit.
- Implemented schema validation with React Hook Form and Zod, resilient handling of corrupt stored data (salvage + backup), and CSV export with proper escaping and spreadsheet-formula protection.
- Wrote a Vitest and React Testing Library suite covering CRUD flows, validation, persistence, budget math, month-boundary dates and CSV output; improved accessibility with focus-trapped dialogs, labelled forms and non-colour status cues.
