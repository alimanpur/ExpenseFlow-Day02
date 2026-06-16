import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, CheckCircle, Clock, History } from 'lucide-react';
import { groupService } from '../services/groupService';
import { settlementService } from '../services/settlementService';
import { useAuthStore } from '../store/authStore';
import RecordSettlementModal from '../components/settlement/RecordSettlementModal';
import { Skeleton, SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function fmt(cents) { return `$${(cents / 100).toFixed(2)}`; }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export default function Settlement() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [tab, setTab] = useState('pending'); // pending | history

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.listGroups,
    onSuccess: (data) => { if (!selectedGroupId && data[0]?.id) setSelectedGroupId(data[0].id); },
  });

  const activeGroupId = selectedGroupId || groups[0]?.id;

  const { data: settlements = [], isLoading: loadingSettlements } = useQuery({
    queryKey: ['settlements', activeGroupId],
    queryFn: () => settlementService.listGroupSettlements(activeGroupId),
    enabled: !!activeGroupId,
  });

  const { data: mySettlements = [], isLoading: loadingMine } = useQuery({
    queryKey: ['my-settlements'],
    queryFn: settlementService.listMySettlements,
  });

  const { data: ledger } = useQuery({
    queryKey: ['group-ledger', activeGroupId],
    queryFn: () => groupService.getGroupLedger(activeGroupId),
    enabled: !!activeGroupId,
  });

  const verifyMutation = useMutation({
    mutationFn: settlementService.verifySettlement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', activeGroupId] });
      qc.invalidateQueries({ queryKey: ['my-settlements'] });
      qc.invalidateQueries({ queryKey: ['group-ledger', activeGroupId] });
      qc.invalidateQueries({ queryKey: ['settlement-rate'] });
      qc.invalidateQueries({ queryKey: ['net-balance'] });
      toast.success('Settlement verified and cleared.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Verification failed.'),
  });

  const pending = settlements.filter((s) => !s.verified);
  const verified = settlements.filter((s) => s.verified);
  const optimalPaths = ledger?.optimalResolutionPaths ?? [];
  const members = ledger?.members ?? [];

  const resolveName = (id) => members.find((m) => m.userId === id)?.user?.name ?? id?.slice(0, 8) ?? '—';

  // All pending across all groups (from /settlements/mine)
  const allPending = mySettlements.filter((s) => !s.verified);
  const allVerified = mySettlements.filter((s) => s.verified);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-brand-900 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Settlement Clearance Matrix</h2>
          <p className="text-xs text-brand-500 mt-0.5 font-mono">Process pending clearances and verify debt resolution across group nodes.</p>
        </div>
        <button onClick={() => setShowRecordModal(true)} className="btn btn-primary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Plus size={12} /> Record Settlement
        </button>
      </div>

      {/* Group Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">Group</span>
        {loadingGroups ? <Skeleton className="h-8 w-48 rounded" /> : (
          <select value={activeGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="input font-mono text-xs w-56">
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
        <div className="ml-auto flex gap-1">
          {['pending', 'history'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`btn font-mono text-[10px] uppercase tracking-wider px-3 ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>
              {t === 'pending' ? <><Clock size={9} className="mr-1" />Pending</> : <><History size={9} className="mr-1" />History</>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Optimal Paths */}
        <div className="card p-4 space-y-3">
          <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
            // Optimal Resolution Paths
          </h3>
          <p className="text-[10px] font-mono text-brand-300">Min-transaction debt simplification output.</p>
          {!activeGroupId || loadingSettlements ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)
          ) : !optimalPaths.length ? (
            <EmptyState message="Ledger balanced. Zero debt paths." />
          ) : (
            <div className="space-y-2">
              {optimalPaths.map((path, i) => (
                <div key={i} className="bg-brand-50 border border-border p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-brand-900">
                    <span className="truncate">{resolveName(path.from)}</span>
                    <span className="text-brand-400 shrink-0">→</span>
                    <span className="truncate">{resolveName(path.to)}</span>
                  </div>
                  <p className="font-mono font-bold text-sm text-green-600">{fmt(path.amountCents)}</p>
                  <button
                    onClick={() => setShowRecordModal(true)}
                    className="btn btn-secondary font-mono text-[9px] uppercase tracking-wider py-1 px-2 w-full"
                  >
                    Record This Payment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pending/History tabs */}
        <div className="lg:col-span-2 space-y-5">
          {tab === 'pending' ? (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">// Pending Clearances — This Group</h3>
                {pending.length > 0 && (
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">{pending.length} PENDING</span>
                )}
              </div>
              {loadingSettlements ? (
                <table className="w-full"><tbody>{Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} cols={4} />)}</tbody></table>
              ) : !pending.length ? (
                <EmptyState message="No pending settlements for this group." />
              ) : (
                <div className="divide-y divide-border">
                  {pending.map((s) => (
                    <div key={s.id} className="px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-brand-900">
                          <span className="truncate">{s.payer?.name ?? '—'}</span>
                          <span className="text-brand-400 shrink-0">→</span>
                          <span className="truncate">{s.receiver?.name ?? '—'}</span>
                        </div>
                        <p className="text-[10px] font-mono text-brand-400 mt-0.5">{fmtDate(s.createdAt)}</p>
                      </div>
                      <span className="font-mono font-bold text-brand-900 shrink-0">{fmt(s.amountCents)}</span>
                      {s.receiverId === user?.id ? (
                        <button
                          onClick={() => verifyMutation.mutate(s.id)}
                          disabled={verifyMutation.isPending}
                          className="btn font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 text-green-700 bg-green-50 border-green-200 hover:bg-green-100 disabled:opacity-40 flex items-center gap-1"
                        >
                          <CheckCircle size={10} /> Verify
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-600 border border-amber-200 bg-amber-50 px-2 py-1">Awaiting</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* History: all settlements across all groups */
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">// Settlement History — All Groups</h3>
                <span className="text-[10px] font-mono text-brand-300">{allVerified.length} verified</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="bg-brand-50 border-b border-border">
                      {['Group', 'From', 'To', 'Amount', 'Date', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMine ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                    ) : !mySettlements.length ? (
                      <tr><td colSpan={6} className="px-5 py-0 border-b border-border"><EmptyState message="No settlement history." /></td></tr>
                    ) : (
                      mySettlements.map((s) => (
                        <tr key={s.id} className="border-b border-border last:border-0 hover:bg-brand-50">
                          <td className="px-4 py-3 text-brand-400">{s.group?.name ?? '—'}</td>
                          <td className="px-4 py-3 font-semibold text-brand-900">{s.payer?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-brand-700">{s.receiver?.name ?? '—'}</td>
                          <td className="px-4 py-3 font-bold text-green-600">{fmt(s.amountCents)}</td>
                          <td className="px-4 py-3 text-brand-400">{fmtDate(s.createdAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase border font-mono ${
                              s.verified ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}>
                              {s.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRecordModal && <RecordSettlementModal groups={groups} onClose={() => setShowRecordModal(false)} />}
    </div>
  );
}
