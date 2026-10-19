import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../src/data/constants';
import { clearAllStorage, loadBudgets, loadSettings, loadTransactions, writeJson } from '../src/services/storage';
import { tx } from './helpers';

const backupOf = (key) => localStorage.getItem(`${key}_corrupt_backup`);

afterEach(() => vi.restoreAllMocks());

describe('loadTransactions', () => {
  it('returns an empty list when nothing is saved', () => {
    expect(loadTransactions()).toEqual({ data: [], status: 'missing' });
  });

  it('round-trips valid data', () => {
    const items = [tx('a', 'expense', 100, '2026-10-01')];
    writeJson(STORAGE_KEYS.transactions, items);
    expect(loadTransactions()).toEqual({ data: items, status: 'ok' });
  });

  it('handles malformed JSON without throwing and keeps a backup', () => {
    localStorage.setItem(STORAGE_KEYS.transactions, '{not json');
    const result = loadTransactions();
    expect(result.data).toEqual([]);
    expect(result.status).toBe('corrupt');
    expect(backupOf(STORAGE_KEYS.transactions)).toBe('{not json');
  });

  it('handles valid JSON of the wrong shape', () => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify({ hello: 'world' }));
    expect(loadTransactions().status).toBe('corrupt');
  });

  it('keeps valid records and skips only the broken ones', () => {
    const good = tx('good', 'expense', 100, '2026-10-01');
    const raw = JSON.stringify([good, { id: 'bad', amountMinor: -5 }, good]);
    localStorage.setItem(STORAGE_KEYS.transactions, raw);
    const result = loadTransactions();
    expect(result.status).toBe('partial');
    expect(result.data).toEqual([good]); // invalid and duplicate removed
    expect(backupOf(STORAGE_KEYS.transactions)).toBe(raw);
  });

  it('reports unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadTransactions().status).toBe('unavailable');
  });
});

describe('writeJson', () => {
  it('returns false instead of throwing when the write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(writeJson('k', { a: 1 })).toBe(false);
  });
});

describe('loadBudgets and loadSettings', () => {
  it('loads valid budgets and salvages valid entries from partly-invalid ones', () => {
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify({ '2026-10': { limitMinor: 500000 } }));
    expect(loadBudgets().status).toBe('ok');

    localStorage.setItem(
      STORAGE_KEYS.budgets,
      JSON.stringify({ '2026-10': { limitMinor: 500000 }, 'oops': { limitMinor: 1 }, '2026-11': { limitMinor: -1 } }),
    );
    const result = loadBudgets();
    expect(result.status).toBe('partial');
    expect(result.data).toEqual({ '2026-10': { limitMinor: 500000 } });
  });

  it('falls back to PKR for missing or invalid settings', () => {
    expect(loadSettings().data.currency).toBe('PKR');
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ currency: 'XXX' }));
    const result = loadSettings();
    expect(result.status).toBe('corrupt');
    expect(result.data.currency).toBe('PKR');
  });
});

describe('clearAllStorage', () => {
  it('removes every ExpenseFlow key and backup', () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.setItem(key, '[]');
      localStorage.setItem(`${key}_corrupt_backup`, 'x');
    }
    localStorage.setItem('unrelated', 'keep me');
    clearAllStorage();
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem('unrelated')).toBe('keep me');
  });
});
