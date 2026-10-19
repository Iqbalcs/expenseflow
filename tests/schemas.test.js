import { describe, expect, it } from 'vitest';
import { transactionFormSchema, transactionSchema } from '../src/utils/schemas';

const valid = { type: 'expense', amount: '120.50', category: 'Food', description: ' Lunch ', date: '2026-10-01' };

describe('transactionFormSchema', () => {
  it('accepts valid input and trims the description', () => {
    const result = transactionFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data.description).toBe('Lunch');
  });

  it.each(['', 'abc', '0', '0.00', '-5', '12.345', '1,000'])('rejects amount %j', (amount) => {
    expect(transactionFormSchema.safeParse({ ...valid, amount }).success).toBe(false);
  });

  it('rejects a category that does not belong to the selected type', () => {
    expect(transactionFormSchema.safeParse({ ...valid, type: 'income', category: 'Food' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, type: 'income', category: 'Salary' }).success).toBe(true);
  });

  it('requires a real date and a description', () => {
    expect(transactionFormSchema.safeParse({ ...valid, date: '2026-02-30' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, date: '' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, description: '   ' }).success).toBe(false);
    expect(transactionFormSchema.safeParse({ ...valid, description: 'x'.repeat(101) }).success).toBe(false);
  });
});

describe('transactionSchema (stored data)', () => {
  const stored = { id: 't1', type: 'income', amountMinor: 100, category: 'Salary', description: '', date: '2026-10-01', createdAt: '2026-10-01T00:00:00.000Z' };
  it('accepts a well-formed record', () => {
    expect(transactionSchema.safeParse(stored).success).toBe(true);
  });
  it('rejects fractional, zero or negative minor units', () => {
    for (const amountMinor of [10.5, 0, -1]) {
      expect(transactionSchema.safeParse({ ...stored, amountMinor }).success).toBe(false);
    }
  });
});
