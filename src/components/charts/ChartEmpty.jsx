export default function ChartEmpty({ message = 'No data for this period yet.' }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">{message}</div>
  );
}
