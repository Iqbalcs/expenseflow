import { describe, expect, it } from 'vitest';
import { buildCsv, escapeCsvCell } from '../src/utils/csvExport';
import { tx } from './helpers';

describe('CSV export', () => {
  it('quotes cells with commas, quotes and newlines', () => {
    expect(escapeCsvCell('Lunch, "big" one')).toBe('"Lunch, ""big"" one"');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeCsvCell('plain')).toBe('plain');
  });
  it('neutralises spreadsheet formulas', () => {
    expect(escapeCsvCell('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(escapeCsvCell('@cmd')).toBe("'@cmd");
  });
  it('builds a header row and formats amounts with two decimals', () => {
    const csv = buildCsv([tx('x', 'expense', 125050, '2026-02-01', 'Food', 'Pizza, "extra" cheese')]);
    expect(csv).toBe('Date,Description,Category,Type,Amount\r\n2026-02-01,"Pizza, ""extra"" cheese",Food,Expense,1250.50');
  });
  it('preserves non-ASCII text', () => {
    expect(buildCsv([tx('x', 'income', 100, '2026-02-01', 'Gifts', 'Eidi – عیدی')])).toContain('Eidi – عیدی');
  });
  it('returns only the header for an empty list', () => {
    expect(buildCsv([])).toBe('Date,Description,Category,Type,Amount');
  });
});
