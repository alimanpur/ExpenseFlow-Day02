import { useQuery } from '@tanstack/react-query';
import { groupService } from '../../services/groupService';
import { SkeletonRow } from '../ui/Skeleton';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecentExpenses() {
  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.listGroups,
  });

  const firstGroupId = groups?.[0]?.id;

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ['group-ledger', firstGroupId],
    queryFn: () => groupService.getGroupLedger(firstGroupId),
    enabled: !!firstGroupId,
  });

  const isLoading = loadingGroups || loadingLedger;
  const expenses = ledger?.expenses?.slice(0, 8) ?? [];

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">
          // Recent Expense Ledger
          {ledger?.group?.name && (
            <span className="text-brand-300 normal-case font-normal ml-2">— {ledger.group.name}</span>
          )}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-brand-50 border-b border-border">
              {['Description', 'Payer', 'Splits', 'Amount', 'Date', 'Category'].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
            ) : !expenses.length ? (
              <tr>
                <td colSpan={6} className="px-5 py-0 border-b border-border">
                  <EmptyState message="No expenses recorded in this group." />
                </td>
              </tr>
            ) : (
              expenses.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-brand-50 transition-none">
                  <td className="px-5 py-3 font-medium text-brand-900 whitespace-nowrap">{row.description}</td>
                  <td className="px-5 py-3 text-brand-500 whitespace-nowrap">{row.payer?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-brand-400">{row.splits?.length ?? 0}</td>
                  <td className="px-5 py-3 font-bold text-brand-900 whitespace-nowrap">
                    ${(row.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-brand-400 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {row.category ? (
                      <StatusBadge status={row.category.name} />
                    ) : (
                      <span className="text-brand-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
