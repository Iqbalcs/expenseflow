import { z } from 'zod';
import { categoriesFor } from '../data/categories';
import { CURRENCIES } from '../data/constants';
import { isValidDateString } from './dates';

export const amountSchema = z
  .string()
  .trim()
  .min(1, 'Amount is required')
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Enter a valid amount with up to 2 decimals')
  .refine((v) => Number(v) > 0, 'Amount must be greater than zero')
  .refine((v) => Number(v) <= 1_000_000_000, 'Amount is too large');

/** Validates the transaction form (values are strings straight from the inputs). */
export const transactionFormSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    amount: amountSchema,
    category: z.string().min(1, 'Select a category'),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(100, 'Keep the description under 100 characters'),
    date: z.string().refine(isValidDateString, 'Enter a valid date'),
  })
  .superRefine((data, ctx) => {
    if (data.category && !categoriesFor(data.type).includes(data.category)) {
      ctx.addIssue({ code: 'custom', path: ['category'], message: 'Select a category' });
    }
  });

/** Validates a transaction as stored in LocalStorage. */
export const transactionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amountMinor: z.number().int().positive(),
  category: z.string().min(1),
  description: z.string(),
  date: z.string().refine(isValidDateString),
  createdAt: z.string(),
});

export const monthKeySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const budgetEntrySchema = z.object({ limitMinor: z.number().int().positive() });
export const budgetsSchema = z.record(monthKeySchema, budgetEntrySchema);
export const settingsSchema = z.object({ currency: z.enum(CURRENCIES) });
