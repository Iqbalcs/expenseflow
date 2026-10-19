import { toMajor } from './money';

const HEADERS = ['Date', 'Description', 'Category', 'Type', 'Amount'];

/** Escape one CSV cell: quote when needed and neutralise spreadsheet formulas. */
export const escapeCsvCell = (value) => {
  let text = String(value ?? '');
  // Prevent CSV/formula injection when the file is opened in Excel or Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const buildCsv = (transactions) => {
  const rows = transactions.map((t) => [
    t.date,
    t.description,
    t.category,
    t.type === 'income' ? 'Income' : 'Expense',
    toMajor(t.amountMinor).toFixed(2),
  ]);
  return [HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
};

/** Trigger a browser download. A BOM is added so Excel reads UTF-8 correctly. */
export const downloadCsv = (filename, csv) => {
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
