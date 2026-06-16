import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Sparkles, UserPlus, Trash2, Edit2, Users, Receipt } from 'lucide-react';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { useAuthStore } from '../store/authStore';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import AddExpenseModal from '../components/groups/AddExpenseModal';
import InviteMemberModal from '../components/groups/InviteMemberModal';
import EditGroupModal from '../components/groups/EditGroupModal';
import DeleteGroupModal from '../components/groups/DeleteGroupModal';
import MemberManagementModal from '../components/groups/MemberManagementModal';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function fmt(cents) { return `$${(cents / 100).toFixed(2)}`; }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

export default function Groups() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [modal, setModal] = useState(null); // 'create'|'expense'|'invite'|'edit'|'delete'|'members'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.listGroups,
    onSuccess: (data) => {
      if (!selectedGroupId && data.length) setSelectedGroupId(data[0].id);
    },
  });

  const activeGroupId = selectedGroupId ?? groups[0]?.id;

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ['group-ledger', activeGroupId],
    queryFn: () => groupService.getGroupLedger(activeGroupId),
    enabled: !!activeGroupId,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group-ledger', activeGroupId] });
      toast.success('Expense removed.');
    },
    onError: () => toast.error('Failed to delete expense.'),
  });

  const handleAiQuickAdd = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !activeGroupId) return;
    setAiLoading(true);
    try {
      await expenseService.aiQuickAdd({ groupId: activeGroupId, promptText: aiPrompt });
      qc.invalidateQueries({ queryKey: ['group-ledger', activeGroupId] });
      qc.invalidateQueries({ queryKey: ['user-activity'] });
      qc.invalidateQueries({ queryKey: ['monthly-spending'] });
      qc.invalidateQueries({ queryKey: ['net-balance'] });
      toast.success('AI transaction parsed and recorded.');
      setAiPrompt('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI parsing failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const selectedGroup = ledger?.group;
  const members = ledger?.members ?? [];
  const expenses = ledger?.expenses ?? [];
  const balances = ledger?.balances ?? {};
  const optimalPaths = ledger?.optimalResolutionPaths ?? [];
  const isOwner = selectedGroup?.ownerId === user?.id;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-brand-900 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Ledger Pools & Ingestion Workspace</h2>
          <p className="text-xs text-brand-500 mt-0.5 font-mono">
            Manage expense groups, participant vectors, and AI transaction parsing.
          </p>
        </div>
        <button onClick={() => setModal('create')} className="btn btn-primary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Plus size={12} /> New Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Group List */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest mb-3">// Group Nodes</p>
          {loadingGroups ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !groups.length ? (
            <EmptyState message="No groups yet. Create one." />
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full text-left card p-4 space-y-1.5 cursor-pointer transition-none ${
                  activeGroupId === group.id ? 'border-brand-900 bg-brand-50' : 'hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-900 truncate">{group.name}</span>
                  <span className="text-[10px] font-mono text-brand-400 shrink-0 ml-2">{group._count?.expenses ?? 0} exp</span>
                </div>
                {group.description && <p className="text-[10px] text-brand-400 font-mono truncate">{group.description}</p>}
                <p className="text-[10px] font-mono text-brand-300">{group.members?.length ?? 0} members</p>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3 space-y-5">
          {!activeGroupId ? (
            <EmptyState message="Select or create a group to view ledger." />
          ) : loadingLedger ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <>
              {/* Group Title Bar */}
              <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-brand-900">{selectedGroup?.name}</h3>
                  {selectedGroup?.description && (
                    <p className="text-[10px] font-mono text-brand-400 mt-0.5">{selectedGroup.description}</p>
                  )}
                  <p className="text-[10px] font-mono text-brand-300 mt-0.5">{selectedGroup?.currency}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setModal('members')} className="btn btn-secondary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={11} /> Members
                  </button>
                  <button onClick={() => setModal('invite')} className="btn btn-secondary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus size={11} /> Invite
                  </button>
                  {isOwner && (
                    <button onClick={() => setModal('edit')} className="btn btn-secondary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => setModal('delete')} className="btn btn-danger font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Trash2 size={11} /> Delete
                    </button>
                  )}
                  <button onClick={() => setModal('expense')} className="btn btn-primary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Plus size={11} /> Expense
                  </button>
                </div>
              </div>

              {/* AI Quick Add */}
              <div className="card p-4 space-y-3">
                <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={10} /> AI Quick Parsing Engine
                </h3>
                <form onSubmit={handleAiQuickAdd} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`"$120 dinner with ${members[0]?.user?.name ?? 'Alex'} split evenly"`}
                    className="input font-mono text-xs flex-1"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="btn btn-primary font-mono text-xs uppercase tracking-wider px-4 disabled:opacity-40 whitespace-nowrap"
                  >
                    {aiLoading ? '// Parsing...' : 'Execute'}
                  </button>
                </form>
              </div>

              {/* Member Balance Matrix */}
              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">// Participant Balance Matrix</h3>
                </div>
                {!members.length ? (
                  <EmptyState message="No members in this group." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="bg-brand-50 border-b border-border">
                          {['Member', 'Email', 'Net Balance', 'Position'].map((h) => (
                            <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => {
                          const bal = balances[m.userId] ?? 0;
                          return (
                            <tr key={m.userId} className="border-b border-border last:border-0 hover:bg-brand-50 transition-none">
                              <td className="px-5 py-3 font-semibold text-brand-900">
                                {m.user?.name ?? '—'}
                                {m.userId === user?.id && <span className="ml-1.5 text-[9px] font-mono text-brand-300">(you)</span>}
                              </td>
                              <td className="px-5 py-3 text-brand-400">{m.user?.email ?? '—'}</td>
                              <td className={`px-5 py-3 font-bold font-mono ${bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-600' : 'text-brand-400'}`}>
                                {bal === 0 ? 'BALANCED' : `${bal > 0 ? '+' : ''}${fmt(Math.abs(bal))}`}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase border font-mono ${
                                  bal === 0 ? 'text-brand-400 bg-brand-50 border-border'
                                  : bal > 0 ? 'text-green-700 bg-green-50 border-green-200'
                                  : 'text-red-700 bg-red-50 border-red-200'
                                }`}>
                                  {bal === 0 ? 'CLEAR' : bal > 0 ? 'CREDITOR' : 'DEBTOR'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Optimal Resolution Paths */}
              {optimalPaths.length > 0 && (
                <div className="card p-4 space-y-3">
                  <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
                    // Optimal Debt Resolution Paths
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {optimalPaths.map((path, i) => {
                      const from = members.find((m) => m.userId === path.from);
                      const to = members.find((m) => m.userId === path.to);
                      return (
                        <div key={i} className="bg-brand-50 border border-border p-3 flex items-center justify-between">
                          <span className="text-xs font-mono text-brand-700 truncate">
                            {from?.user?.name ?? path.from}
                            <span className="text-brand-400 mx-1.5">→</span>
                            {to?.user?.name ?? path.to}
                          </span>
                          <span className="font-mono font-bold text-sm text-green-600 shrink-0 ml-3">{fmt(path.amountCents)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expense Feed */}
              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">// Expense Transaction Feed</h3>
                  <span className="text-[10px] font-mono text-brand-300">{expenses.length} records</span>
                </div>
                {!expenses.length ? (
                  <EmptyState message="No expenses yet. Add one above." />
                ) : (
                  <div className="divide-y divide-border">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-brand-50 transition-none group">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-brand-900 truncate">{exp.description}</p>
                            {exp.category && (
                              <span className="text-[9px] font-mono text-brand-400 border border-border px-1.5 py-0.5 shrink-0">{exp.category.name}</span>
                            )}
                            {exp.receiptUrl && <Receipt size={10} className="text-brand-300 shrink-0" />}
                          </div>
                          <p className="text-[10px] font-mono text-brand-400 mt-0.5">
                            Paid by {exp.payer?.name ?? '—'} · {exp.splits?.length ?? 0} splits · {fmtDate(exp.createdAt)}
                          </p>
                          {exp.notes && <p className="text-[10px] font-mono text-brand-300 mt-0.5 italic">"{exp.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-brand-900">{fmt(exp.amountCents)}</span>
                          {(exp.payerId === user?.id || isOwner) && (
                            <button
                              onClick={() => deleteExpenseMutation.mutate(exp.id)}
                              disabled={deleteExpenseMutation.isPending}
                              className="opacity-0 group-hover:opacity-100 text-brand-300 hover:text-red-500 transition-none p-0.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'create' && <CreateGroupModal onClose={() => setModal(null)} />}
      {modal === 'expense' && activeGroupId && (
        <AddExpenseModal groupId={activeGroupId} members={members} onClose={() => setModal(null)} />
      )}
      {modal === 'invite' && activeGroupId && (
        <InviteMemberModal groupId={activeGroupId} onClose={() => setModal(null)} />
      )}
      {modal === 'edit' && selectedGroup && (
        <EditGroupModal group={selectedGroup} onClose={() => setModal(null)} />
      )}
      {modal === 'delete' && selectedGroup && (
        <DeleteGroupModal
          group={selectedGroup}
          onClose={() => setModal(null)}
          onDeleted={() => setSelectedGroupId(null)}
        />
      )}
      {modal === 'members' && selectedGroup && (
        <MemberManagementModal group={selectedGroup} members={members} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
