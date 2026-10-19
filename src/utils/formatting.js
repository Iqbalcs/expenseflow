import { format, parseISO } from 'date-fns';

export { toMinor, toMajor, formatMoney, formatCompact } from './money';

export const formatDate = (dateStr) => format(parseISO(dateStr), 'dd MMM yyyy');
export const formatLongDate = (date = new Date()) => format(date, 'EEEE, d MMMM yyyy');
export const formatPercent = (ratio) => `${Math.round(ratio * 100)}%`;
