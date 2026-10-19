import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../src/data/constants';
import { ExpenseProvider } from '../src/context/ExpenseContext';
import Transactions from '../src/pages/Transactions';
import { tx } from './helpers';

const groceries = tx('t1', 'expense', 125000, '2026-10-01', 'Food', 'Groceries');
const salary = tx('t2', 'income', 9000000, '2026-10-02', 'Salary', 'Monthly pay');
const rent = tx('t3', 'expense', 4500000, '2026-10-03', 'Bills & Utilities', 'Rent');

const seed = (items) => localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(items));
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions));
const ui = () => (
  <MemoryRouter>
    <ExpenseProvider>
      <Transactions />
    </ExpenseProvider>
  </MemoryRouter>
);

async function openAddDialog(user) {
  await user.click(screen.getAllByRole('button', { name: 'Add transaction' })[0]);
  return screen.getByRole('dialog', { name: 'Add transaction' });
}

async function fillForm(user, dialog, { amount, category, description }) {
  await user.type(within(dialog).getByLabelText('Amount'), amount);
  await user.selectOptions(within(dialog).getByLabelText('Category'), category);
  await user.type(within(dialog).getByLabelText('Description'), description);
}

describe('creating transactions', () => {
  it('adds a transaction, shows it, and saves it as integer minor units', async () => {
    const user = userEvent.setup();
    render(ui());
    const dialog = await openAddDialog(user);
    await fillForm(user, dialog, { amount: '1250.50', category: 'Food', description: 'Lunch with team' });
    await user.click(within(dialog).getByRole('button', { name: 'Save transaction' }));

    expect(await screen.findByText('Lunch with team')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(stored()).toHaveLength(1);
    expect(stored()[0]).toMatchObject({ type: 'expense', amountMinor: 125050, category: 'Food', description: 'Lunch with team' });
  });

  it('shows validation messages and saves nothing when the form is empty', async () => {
    const user = userEvent.setup();
    render(ui());
    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Save transaction' }));

    expect(await within(dialog).findByText('Amount is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Select a category')).toBeInTheDocument();
    expect(within(dialog).getByText('Description is required')).toBeInTheDocument();
    expect(stored()).toEqual([]);
  });

  it('rejects an amount of zero', async () => {
    const user = userEvent.setup();
    render(ui());
    const dialog = await openAddDialog(user);
    await fillForm(user, dialog, { amount: '0', category: 'Food', description: 'Nothing' });
    await user.click(within(dialog).getByRole('button', { name: 'Save transaction' }));

    expect(await within(dialog).findByText('Amount must be greater than zero')).toBeInTheDocument();
    expect(stored()).toEqual([]);
  });

  it('offers income categories after switching the type', async () => {
    const user = userEvent.setup();
    render(ui());
    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByLabelText('Income'));
    const options = within(within(dialog).getByLabelText('Category')).getAllByRole('option').map((o) => o.textContent);
    expect(options).toContain('Salary');
    expect(options).not.toContain('Food');
  });
});

describe('editing and deleting', () => {
  it('edits an existing transaction and keeps its id', async () => {
    seed([groceries]);
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', { name: 'Edit Groceries' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit transaction' });

    const description = within(dialog).getByLabelText('Description');
    await user.clear(description);
    await user.type(description, 'Weekly groceries');
    const amount = within(dialog).getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '1500');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Weekly groceries')).toBeInTheDocument();
    expect(stored()).toHaveLength(1);
    expect(stored()[0]).toMatchObject({ id: 't1', amountMinor: 150000, description: 'Weekly groceries', createdAt: groceries.createdAt });
  });

  it('asks for confirmation before deleting, and cancel keeps the data', async () => {
    seed([groceries]);
    const user = userEvent.setup();
    render(ui());

    await user.click(screen.getByRole('button', { name: 'Delete Groceries' }));
    let dialog = screen.getByRole('dialog', { name: 'Delete transaction?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(stored()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Delete Groceries' }));
    dialog = screen.getByRole('dialog', { name: 'Delete transaction?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('No transactions yet')).toBeInTheDocument();
    expect(stored()).toEqual([]);
  });
});

describe('persistence', () => {
  it('shows saved transactions on startup', () => {
    seed([groceries, salary]);
    render(ui());
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Monthly pay')).toBeInTheDocument();
  });

  it('survives a remount (simulated refresh)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(ui());
    const dialog = await openAddDialog(user);
    await fillForm(user, dialog, { amount: '99', category: 'Food', description: 'Persisted item' });
    await user.click(within(dialog).getByRole('button', { name: 'Save transaction' }));
    await screen.findByText('Persisted item');
    unmount();

    render(ui());
    expect(screen.getByText('Persisted item')).toBeInTheDocument();
  });

  it('starts empty instead of crashing on corrupted stored data', () => {
    localStorage.setItem(STORAGE_KEYS.transactions, '{definitely not json');
    render(ui());
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(localStorage.getItem(`${STORAGE_KEYS.transactions}_corrupt_backup`)).toBe('{definitely not json');
  });
});

describe('search, filters and pagination', () => {
  it('filters by search text and by type', async () => {
    seed([groceries, salary, rent]);
    const user = userEvent.setup();
    render(ui());

    await user.type(screen.getByLabelText('Search'), 'rent');
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search'));
    await user.selectOptions(screen.getByLabelText('Type'), 'income');
    expect(screen.getByText('Monthly pay')).toBeInTheDocument();
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();
  });

  it('shows a helpful empty state when nothing matches', async () => {
    seed([groceries]);
    const user = userEvent.setup();
    render(ui());
    await user.type(screen.getByLabelText('Search'), 'zzz');
    expect(screen.getByText('No transactions match your filters')).toBeInTheDocument();
    // One reset button lives in the filter bar and one in the empty state; either works.
    const resetButtons = screen.getAllByRole('button', { name: 'Reset filters' });
    await user.click(resetButtons[resetButtons.length - 1]);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('paginates long lists', async () => {
    seed(Array.from({ length: 12 }, (_, i) => tx(`id${i}`, 'expense', 100 + i, `2026-10-${String(i + 1).padStart(2, '0')}`, 'Food', `Item ${i}`)));
    const user = userEvent.setup();
    render(ui());
    expect(screen.getByText('Showing 1–10 of 12')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(screen.getByText('Showing 11–12 of 12')).toBeInTheDocument();
  });
});
