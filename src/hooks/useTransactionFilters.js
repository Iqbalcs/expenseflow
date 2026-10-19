import { useCallback, useMemo, useState } from 'react';
import { PAGE_SIZE } from '../data/constants';
import { filterTransactions, sortTransactions } from '../utils/calculations';

const DEFAULT_FILTERS = { search: '', type: 'all', category: 'all', from: '', to: '', sort: 'date-desc' };

export function useTransactionFilters(transactions, pageSize = PAGE_SIZE) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const results = useMemo(() => {
    const [sortBy, direction] = filters.sort.split('-');
    return sortTransactions(filterTransactions(transactions, filters), sortBy, direction);
  }, [transactions, filters]);

  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(page, pageCount); // stays valid after deletes
  const pageItems = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasActiveFilters = Boolean(
    filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.from || filters.to,
  );

  return { filters, setFilter, reset, results, pageItems, page: currentPage, pageCount, setPage, hasActiveFilters };
}
