// Money is stored as integer minor units (paisa for PKR) to avoid floating-point errors.

/** Convert a user-entered amount ("1250.5") to integer minor units (125050). */
export const toMinor = (value) => Math.round(Number(`${String(value).trim()}e2`));

/** Convert integer minor units back to a major-unit number (125050 -> 1250.5). */
export const toMajor = (minor) => minor / 100;

export const formatMoney = (minor, currency = 'PKR') => {
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(toMajor(minor));
  } catch {
    return `${currency} ${toMajor(minor).toFixed(2)}`;
  }
};

export const formatCompact = (minor) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(toMajor(minor));
