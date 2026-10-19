export const tx = (id, type, amountMinor, date, category = 'Food', description = id) => ({
  id,
  type,
  amountMinor,
  date,
  category,
  description,
  createdAt: `${date}T00:00:00.000Z`,
});
