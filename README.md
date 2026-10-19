# ExpenseFlow

A responsive expense tracker for managing income, expenses, monthly budgets, and financial reports. ExpenseFlow runs entirely in the browser and stores data locally on your device.

![ExpenseFlow dashboard](screenshot/Screenshot%202026-10-19%20003502.png)

## Features

- Track, edit, search, filter, and delete income and expense transactions
- Monitor income, spending, net balance, and budget progress
- Explore financial data through interactive charts
- Set monthly spending budgets
- Filter reports by date, type, and category
- Export filtered reports to CSV
- Choose a display currency
- Use demo data to explore the application
- Responsive and accessible interface

## Screenshots

| Analytics | Spending categories |
| --- | --- |
| ![Income, expenses, and spending trend charts](screenshot/Screenshot%202026-10-19%20003550.png) | ![Expense category charts](screenshot/Screenshot%202026-10-19%20003852.png) |

| Transactions | Budgets |
| --- | --- |
| ![Transactions page](screenshot/Screenshot%202026-10-19%20003928.png) | ![Budgets page](screenshot/Screenshot%202026-10-19%20004006.png) |

| Reports | Settings |
| --- | --- |
| ![Reports page](screenshot/Screenshot%202026-10-19%20004037.png) | ![Settings page](screenshot/Screenshot%202026-10-19%20004126.png) |

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts
- React Hook Form and Zod
- Vitest and React Testing Library

## Getting Started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/YOUR_USERNAME/expenseflow.git
cd expenseflow
npm install
npm run dev
```

Open the local URL shown by Vite. To explore the app with sample records, open **Settings** and select **Load demo data**.

## Available Scripts

```bash
npm run dev      # Start the development server
npm test         # Run the test suite
npm run build    # Create a production build
npm run preview  # Preview the production build
```

## Data Storage

ExpenseFlow has no backend. Transactions, budgets, and settings are stored in your browser's LocalStorage, so data does not sync between devices and is removed if browser storage is cleared.
