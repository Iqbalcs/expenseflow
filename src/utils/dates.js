// All dates are plain "YYYY-MM-DD" strings (local calendar dates) and months are
// "YYYY-MM" keys. Using strings avoids timezone drift at month boundaries, and
// ISO strings compare correctly with < and >.

const pad = (n) => String(n).padStart(2, '0');
const parts = (dateStr) => dateStr.split('-').map(Number);

export const toDateString = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayString = () => toDateString(new Date());
export const monthKey = (dateStr) => dateStr.slice(0, 7);
export const currentMonthKey = (now = new Date()) => toDateString(now).slice(0, 7);

export const addMonths = (key, n) => {
  const [y, m] = parts(key);
  const index = y * 12 + (m - 1) + n;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
};

export const daysInMonth = (key) => {
  const [y, m] = parts(key);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

export const firstDayOfMonth = (key) => `${key}-01`;
export const lastDayOfMonth = (key) => `${key}-${pad(daysInMonth(key))}`;

export const addDays = (dateStr, n) => {
  const [y, m, d] = parts(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
};

export const diffDays = (from, to) => {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

export const monthsBetween = (startKey, endKey) => {
  const months = [];
  let key = startKey;
  while (key <= endKey && months.length < 600) {
    months.push(key);
    key = addMonths(key, 1);
  }
  return months;
};

export const isValidDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parts(value);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

export const monthLabel = (key, long = false) => {
  const [y, m] = parts(key);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en', {
    month: long ? 'long' : 'short',
    year: long ? 'numeric' : '2-digit',
    timeZone: 'UTC',
  });
};

export const dayLabel = (dateStr) => {
  const [y, m, d] = parts(dateStr);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleString('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
};
