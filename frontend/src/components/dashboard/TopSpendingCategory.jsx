import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import { Skeleton } from '../ui/Skeleton';

function fmt(cents) { return `$${(cents / 100).toFixed(2)}`; }

const SHADES = ['bg-brand-900', 'bg-brand-600', 'bg-brand-400', 'bg-brand-200', 'bg-brand-100'];

export default function TopSpendingCategory() {
  const { data: cats = [], isLoading } = useQuery({
    queryKey: ['category-spending'],
    queryFn: analyticsService.getCategorySpending,
  });

  const top = cats.slice(0, 5);
  const maxAmt = top[0]?.amountCents ?? 1;

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
        // Top Spending Categories
      </h3>
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 rounded" />)
      ) : !top.length ? (
        <p className="text-[10px] font-mono text-brand-300 py-4 text-center">No category data.</p>
      ) : (
        <div className="space-y-2.5">
          {top.map((cat, i) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-brand-600 font-semibold truncate">{cat.category}</span>
                <span className="text-brand-900 font-bold ml-2">{fmt(cat.amountCents)}</span>
              </div>
              <div className="h-1 bg-brand-100 w-full">
                <div
                  className={`h-1 ${SHADES[i]}`}
                  style={{ width: `${(cat.amountCents / maxAmt) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
