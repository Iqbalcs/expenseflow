import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../data/constants';
import { budgetEntrySchema, budgetsSchema, monthKeySchema, settingsSchema, transactionSchema } from '../utils/schemas';

// LocalStorage is plain text, per-browser and per-device. It is NOT encrypted and
// can be cleared by the user or the browser. Every read is validated before use.

const backupKey = (key) => `${key}_corrupt_backup`;

function readRaw(key) {
  try {
    return { raw: localStorage.getItem(key), available: true };
  } catch {
    return { raw: null, available: false };
  }
}

// Keep the unreadable payload so the user's data is never silently destroyed.
function keepBackup(key, raw) {
  try {
    localStorage.setItem(backupKey(key), raw);
  } catch {
    /* nothing more we can do */
  }
}

const unavailable = (data) => ({
  data,
  status: 'unavailable',
  message: 'Browser storage is unavailable. Your changes will not be saved.',
});

/** Returns true when the value was written successfully. */
export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadTransactions() {
  const key = STORAGE_KEYS.transactions;
  const { raw, available } = readRaw(key);
  if (!available) return unavailable([]);
  if (raw === null) return { data: [], status: 'missing' };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    keepBackup(key, raw);
    return { data: [], status: 'corrupt', message: 'Saved transactions could not be read. A backup copy was kept.' };
  }
  if (!Array.isArray(parsed)) {
    keepBackup(key, raw);
    return { data: [], status: 'corrupt', message: 'Saved transactions had an unexpected format. A backup copy was kept.' };
  }

  // Keep every valid, unique record and skip only the broken ones.
  const seen = new Set();
  const valid = [];
  for (const item of parsed) {
    const result = transactionSchema.safeParse(item);
    if (result.success && !seen.has(result.data.id)) {
      seen.add(result.data.id);
      valid.push(result.data);
    }
  }
  if (valid.length !== parsed.length) {
    keepBackup(key, raw);
    const skipped = parsed.length - valid.length;
    return {
      data: valid,
      status: 'partial',
      message: `${skipped} invalid transaction${skipped === 1 ? ' was' : 's were'} skipped. A backup copy was kept.`,
    };
  }
  return { data: valid, status: 'ok' };
}

export function loadBudgets() {
  const key = STORAGE_KEYS.budgets;
  const { raw, available } = readRaw(key);
  if (!available) return unavailable({});
  if (raw === null) return { data: {}, status: 'missing' };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    keepBackup(key, raw);
    return { data: {}, status: 'corrupt', message: 'Saved budgets could not be read. A backup copy was kept.' };
  }
  const whole = budgetsSchema.safeParse(parsed);
  if (whole.success) return { data: whole.data, status: 'ok' };

  const salvaged = {};
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    for (const [month, entry] of Object.entries(parsed)) {
      if (monthKeySchema.safeParse(month).success && budgetEntrySchema.safeParse(entry).success) {
        salvaged[month] = entry;
      }
    }
  }
  keepBackup(key, raw);
  return { data: salvaged, status: 'partial', message: 'Some saved budgets were invalid and skipped. A backup copy was kept.' };
}

export function loadSettings() {
  const key = STORAGE_KEYS.settings;
  const { raw, available } = readRaw(key);
  if (!available) return unavailable(DEFAULT_SETTINGS);
  if (raw === null) return { data: DEFAULT_SETTINGS, status: 'missing' };
  try {
    const result = settingsSchema.safeParse(JSON.parse(raw));
    if (result.success) return { data: result.data, status: 'ok' };
  } catch {
    /* fall through */
  }
  keepBackup(key, raw);
  return { data: DEFAULT_SETTINGS, status: 'corrupt', message: 'Saved settings were invalid and have been reset.' };
}

export function clearAllStorage() {
  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
      localStorage.removeItem(backupKey(key));
    }
    return true;
  } catch {
    return false;
  }
}
