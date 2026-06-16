export default function EmptyState({ message = 'No data found.', icon = '//' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <span className="text-lg font-mono text-brand-200 font-bold select-none">{icon}</span>
      <p className="text-xs font-mono text-brand-400">{message}</p>
    </div>
  );
}
