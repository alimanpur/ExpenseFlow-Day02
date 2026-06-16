import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsService } from '../../services/analyticsService';
import { settlementService } from '../../services/settlementService';
import { useAuthStore } from '../../store/authStore';
import { Skeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

function fmt(cents) { return `$${(cents / 100).toFixed(2)}`; }

export default function PendingSettlements() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: netBalance, isLoading } = useQuery({
    queryKey: ['net-balance'],
    queryFn: analyticsService.getNetBalance,
  });

  const verifyMutation = useMutation({
    mutationFn: settlementService.verifySettlement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['net-balance'] });
      qc.invalidateQueries({ queryKey: ['settlement-rate'] });
      toast.success('Settlement verified.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });

  const pending = netBalance?.pendingSettlements ?? [];

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">// Pending Settlements</h3>
        {pending.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">
            {pending.length} PENDING
          </span>
        )}
      </div>
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-16 rounded ml-auto" />
            </div>
          ))
        ) : !pending.length ? (
          <EmptyState message="No pending settlements." />
        ) : (
          pending.slice(0, 5).map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-mono font-semibold text-brand-900 truncate">
                  {s.payer?.name} → {s.receiver?.name}
                </p>
                <p className="text-[10px] font-mono text-brand-400 mt-0.5">{s.group?.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-sm text-brand-900">{fmt(s.amountCents)}</span>
                {s.receiverId === user?.id && (
                  <button
                    onClick={() => verifyMutation.mutate(s.id)}
                    disabled={verifyMutation.isPending}
                    className="btn font-mono text-[10px] uppercase tracking-wider px-2 py-1 text-green-700 bg-green-50 border-green-200 hover:bg-green-100 disabled:opacity-40 flex items-center gap-1"
                  >
                    <CheckCircle size={9} /> Verify
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
