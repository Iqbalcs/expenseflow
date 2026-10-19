import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoriesFor } from '../../data/categories';
import { todayString } from '../../utils/dates';
import { toMajor, toMinor } from '../../utils/money';
import { transactionFormSchema } from '../../utils/schemas';
import Button from '../ui/Button';
import Field, { inputClass } from '../ui/Field';

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const toFormValues = (t) =>
  t
    ? { type: t.type, amount: toMajor(t.amountMinor).toFixed(2), category: t.category, description: t.description, date: t.date }
    : { type: 'expense', amount: '', category: '', description: '', date: todayString() };

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(transactionFormSchema), defaultValues: toFormValues(initial) });

  const type = watch('type');

  // Categories depend on the type, so clear a category that no longer applies.
  useEffect(() => {
    if (!categoriesFor(type).includes(getValues('category'))) setValue('category', '');
  }, [type, getValues, setValue]);

  const submit = (values) =>
    onSubmit({
      type: values.type,
      amountMinor: toMinor(values.amount),
      category: values.category,
      description: values.description.trim(),
      date: values.date,
    });

  const describe = (name) => (errors[name] ? `${name}-error` : undefined);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 has-checked:border-primary-600 has-checked:bg-primary-50 has-checked:text-primary-700 has-focus-visible:outline-2 has-focus-visible:outline-primary-600"
            >
              <input type="radio" value={value} className="sr-only" {...register('type')} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Amount" htmlFor="amount" error={errors.amount?.message}>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={describe('amount')}
          className={inputClass(errors.amount)}
          {...register('amount')}
        />
      </Field>

      <Field label="Category" htmlFor="category" error={errors.category?.message}>
        <select
          id="category"
          aria-invalid={Boolean(errors.category)}
          aria-describedby={describe('category')}
          className={inputClass(errors.category)}
          {...register('category')}
        >
          <option value="">Select a category</option>
          {categoriesFor(type).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <input
          id="description"
          type="text"
          maxLength={100}
          autoComplete="off"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={describe('description')}
          className={inputClass(errors.description)}
          {...register('description')}
        />
      </Field>

      <Field label="Date" htmlFor="date" error={errors.date?.message}>
        <input
          id="date"
          type="date"
          aria-invalid={Boolean(errors.date)}
          aria-describedby={describe('date')}
          className={inputClass(errors.date)}
          {...register('date')}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Save changes' : 'Save transaction'}</Button>
      </div>
    </form>
  );
}
