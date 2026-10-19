import { useCallback } from 'react';
import { formatMoney } from '../utils/money';
import { useExpenses } from './useExpenses';

/** Returns a function that formats minor units in the user's chosen currency. */
export function useMoney() {
  const { settings } = useExpenses();
  return useCallback((minor) => formatMoney(minor, settings.currency), [settings.currency]);
}
