import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, SearchX, Wallet } from 'lucide-react';
import Pagination from '../components/transactions/Pagination';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionTable from '../components/transactions/TransactionTable';
import Button, { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { PAGE_SIZE } from '../data/constants';
import { useExpenses } from '../hooks/useExpenses';
import { useMoney } from '../hooks/useMoney';
import { useTransactionFilters } from '../hooks/useTransactionFilters';

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpenses();
  const format = useMoney();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = useTransactionFilters(transactions);

  // The header's "Add transaction" link navigates here with ?new=1.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const handleSubmit = (values) => {
    if (editing) {
      updateTransaction(editing.id, values);
      toast.success('Transaction updated');
    } else {
      addTransaction(values);
      toast.success('Transaction added');
    }
    closeForm();
  };

  const confirmDelete = () => {
    deleteTransaction(deleting.id);
    setDeleting(null);
    toast.success('Transaction deleted');
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add transaction
        </Button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Add your first transaction to start tracking income and expenses."
        >
          <Button onClick={openAdd}>Add transaction</Button>
          <Link to="/settings" className={buttonStyles('secondary')}>
            Load demo data
          </Link>
        </EmptyState>
      ) : (
        <>
          <Card>
            <TransactionFilters
              filters={list.filters}
              onChange={list.setFilter}
              onReset={list.reset}
              hasActiveFilters={list.hasActiveFilters}
            />
          </Card>

          {list.results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No transactions match your filters"
              description="Try a different search or widen the date range."
            >
              <Button variant="secondary" onClick={list.reset}>
                Reset filters
              </Button>
            </EmptyState>
          ) : (
            <Card>
              <TransactionTable transactions={list.pageItems} onEdit={openEdit} onDelete={setDeleting} />
              <Pagination
                page={list.page}
                pageCount={list.pageCount}
                total={list.results.length}
                pageSize={PAGE_SIZE}
                onPageChange={list.setPage}
              />
            </Card>
          )}
        </>
      )}

      <Modal open={formOpen} onClose={closeForm} title={editing ? 'Edit transaction' : 'Add transaction'}>
        <TransactionForm initial={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction?"
        message={deleting ? `"${deleting.description}" (${format(deleting.amountMinor)}) will be removed. This can't be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
