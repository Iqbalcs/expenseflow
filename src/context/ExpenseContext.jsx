import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '../data/constants';
import { buildDemoData } from '../data/demoData';
import { clearAllStorage, loadBudgets, loadSettings, loadTransactions, writeJson } from '../services/storage';
import { todayString } from '../utils/dates';

export const ExpenseContext = createContext(null);

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function init() {
  const transactions = loadTransactions();
  const budgets = loadBudgets();
  const settings = loadSettings();
  return {
    transactions: transactions.data,
    budgets: budgets.data,
    settings: settings.data,
    loadIssues: [transactions, budgets, settings].map((r) => r.message).filter(Boolean),
  };
}

// State is never mutated: every case returns new objects/arrays.
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t)),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'SET_BUDGET':
      return { ...state, budgets: { ...state.budgets, [action.month]: { limitMinor: action.limitMinor } } };
    case 'REMOVE_BUDGET': {
      const { [action.month]: _removed, ...rest } = state.budgets;
      return { ...state, budgets: rest };
    }
    case 'SET_CURRENCY':
      return { ...state, settings: { ...state.settings, currency: action.currency } };
    case 'LOAD_DEMO': {
      const existingIds = new Set(state.transactions.map((t) => t.id));
      const fresh = action.demo.transactions.filter((t) => !existingIds.has(t.id));
      // Existing user budgets always win over demo budgets.
      return {
        ...state,
        transactions: [...state.transactions, ...fresh],
        budgets: { ...action.demo.budgets, ...state.budgets },
      };
    }
    case 'CLEAR_ALL':
      return { ...state, transactions: [], budgets: {} };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Tell the user once if saved data had problems.
  useEffect(() => {
    state.loadIssues.forEach((message) => toast.warning(message, { id: message, duration: 8000 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist each slice whenever it changes; surface write failures (e.g. quota exceeded).
  useEffect(() => {
    if (!writeJson(STORAGE_KEYS.transactions, state.transactions)) notifyWriteFailure();
  }, [state.transactions]);
  useEffect(() => {
    if (!writeJson(STORAGE_KEYS.budgets, state.budgets)) notifyWriteFailure();
  }, [state.budgets]);
  useEffect(() => {
    if (!writeJson(STORAGE_KEYS.settings, state.settings)) notifyWriteFailure();
  }, [state.settings]);

  const addTransaction = useCallback((input) => {
    const transaction = { id: createId(), createdAt: new Date().toISOString(), ...input };
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    return transaction;
  }, []);
  const updateTransaction = useCallback((id, changes) => dispatch({ type: 'UPDATE_TRANSACTION', id, changes }), []);
  const deleteTransaction = useCallback((id) => dispatch({ type: 'DELETE_TRANSACTION', id }), []);
  const setBudget = useCallback((month, limitMinor) => dispatch({ type: 'SET_BUDGET', month, limitMinor }), []);
  const removeBudget = useCallback((month) => dispatch({ type: 'REMOVE_BUDGET', month }), []);
  const setCurrency = useCallback((currency) => dispatch({ type: 'SET_CURRENCY', currency }), []);
  const loadDemoData = useCallback(() => dispatch({ type: 'LOAD_DEMO', demo: buildDemoData(todayString()) }), []);
  const clearAllData = useCallback(() => {
    clearAllStorage();
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value = useMemo(
    () => ({
      transactions: state.transactions,
      budgets: state.budgets,
      settings: state.settings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      removeBudget,
      setCurrency,
      loadDemoData,
      clearAllData,
    }),
    [state, addTransaction, updateTransaction, deleteTransaction, setBudget, removeBudget, setCurrency, loadDemoData, clearAllData],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

function notifyWriteFailure() {
  toast.error('Could not save to browser storage. Recent changes may be lost when you refresh.', {
    id: 'storage-write-error',
  });
}
