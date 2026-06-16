const variants = {
  settled:  'text-green-700 bg-green-50 border-green-200',
  verified: 'text-green-700 bg-green-50 border-green-200',
  pending:  'text-amber-700 bg-amber-50 border-amber-200',
  active:   'text-brand-600 bg-brand-50 border-border',
  creditor: 'text-green-700 bg-green-50 border-green-200',
  debtor:   'text-red-700 bg-red-50 border-red-200',
  clear:    'text-brand-400 bg-brand-50 border-border',
  invite:   'text-blue-700 bg-blue-50 border-blue-200',
  info:     'text-brand-600 bg-brand-50 border-border',
  expense:  'text-amber-700 bg-amber-50 border-amber-200',
  settlement: 'text-green-700 bg-green-50 border-green-200',
};

export default function StatusBadge({ status }) {
  const cls = variants[status?.toLowerCase?.()] ?? variants.info;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border font-mono ${cls}`}>
      {status}
    </span>
  );
}
