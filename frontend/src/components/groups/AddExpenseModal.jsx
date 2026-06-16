import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Upload, X } from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import Modal from '../ui/Modal';

export default function AddExpenseModal({ groupId, members, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    description: '',
    amountCents: '',
    payerId: members?.[0]?.userId ?? '',
    categoryId: '',
    notes: '',
  });
  const [splits, setSplits] = useState(
    members?.map((m) => ({ userId: m.userId, name: m.user?.name, amountCents: '' })) ?? []
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: expenseService.getCategories,
  });

  const addMutation = useMutation({
    mutationFn: expenseService.addExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group-ledger', groupId] });
      qc.invalidateQueries({ queryKey: ['user-activity'] });
      qc.invalidateQueries({ queryKey: ['monthly-spending'] });
      qc.invalidateQueries({ queryKey: ['net-balance'] });
      toast.success('Expense recorded.');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add expense.'),
  });

  const handleSplitChange = (idx, val) =>
    setSplits((s) => s.map((r, i) => i === idx ? { ...r, amountCents: val } : r));

  const handleEqualSplit = () => {
    const total = parseInt(form.amountCents) || 0;
    const per = Math.floor(total / splits.length);
    setSplits((s) => s.map((r) => ({ ...r, amountCents: String(per) })));
  };

  const runAiParse = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiPreview(null);
    try {
      const parsed = await expenseService.parseAI({ groupId, promptText: aiPrompt });
      setAiPreview(parsed);
      setForm((f) => ({
        ...f,
        description: parsed.description ?? f.description,
        amountCents: String(parsed.amountCents ?? f.amountCents),
        payerId: parsed.payerId ?? f.payerId,
      }));
      if (parsed.splits?.length) {
        setSplits((s) =>
          s.map((r) => {
            const match = parsed.splits.find((ps) => ps.userId === r.userId);
            return match ? { ...r, amountCents: String(match.amountCents) } : r;
          })
        );
      }
      toast.success('AI parsed — review and confirm.');
    } catch {
      toast.error('AI parsing failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validSplits = splits.filter((s) => s.amountCents && parseInt(s.amountCents) > 0);
    if (!validSplits.length) return toast.error('Add at least one split.');

    let receiptUrl = null;
    if (receiptFile) {
      setUploading(true);
      try {
        const uploaded = await expenseService.uploadReceipt(receiptFile);
        receiptUrl = uploaded.url;
      } catch {
        toast.error('Receipt upload failed. Saving without receipt.');
      } finally {
        setUploading(false);
      }
    }

    addMutation.mutate({
      groupId,
      description: form.description,
      amountCents: parseInt(form.amountCents),
      payerId: form.payerId,
      categoryId: form.categoryId || undefined,
      notes: form.notes || undefined,
      receiptUrl: receiptUrl || undefined,
      splits: validSplits.map((s) => ({ userId: s.userId, amountCents: parseInt(s.amountCents) })),
    });
  };

  const busy = addMutation.isPending || uploading;

  return (
    <Modal title="// Log Expense Transaction" onClose={onClose} width="max-w-xl">
      {/* AI Quick Parse */}
      <div className="bg-brand-50 border border-border p-3 space-y-2 mb-4">
        <p className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={10} /> AI Parser
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={`"$120 dinner split evenly between ${members?.[0]?.user?.name ?? 'Alex'} and me"`}
            className="input font-mono text-xs flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runAiParse())}
          />
          <button
            type="button"
            onClick={runAiParse}
            disabled={aiLoading || !aiPrompt.trim()}
            className="btn btn-secondary font-mono text-xs uppercase tracking-wider px-3 disabled:opacity-40 whitespace-nowrap"
          >
            {aiLoading ? '...' : 'Parse'}
          </button>
        </div>
        {aiPreview && (
          <div className="bg-white border border-border p-2 text-[10px] font-mono text-brand-600 space-y-0.5">
            <p><span className="text-brand-400">description:</span> {aiPreview.description}</p>
            <p><span className="text-brand-400">amount:</span> ${(aiPreview.amountCents / 100).toFixed(2)}</p>
            <p><span className="text-brand-400">splits:</span> {aiPreview.splits?.length} participants</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input font-mono text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Amount (cents)</label>
            <input
              type="number"
              value={form.amountCents}
              onChange={(e) => setForm((f) => ({ ...f, amountCents: e.target.value }))}
              placeholder="12000 = $120.00"
              className="input font-mono text-sm"
              min={1}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Paid By</label>
            <select value={form.payerId} onChange={(e) => setForm((f) => ({ ...f, payerId: e.target.value }))} className="input font-mono text-sm">
              {members?.map((m) => <option key={m.userId} value={m.userId}>{m.user?.name ?? m.userId}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input font-mono text-sm">
              <option value="">Uncategorized</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Optional note..."
            className="input font-mono text-sm"
          />
        </div>

        {/* Receipt Upload */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Receipt</label>
          <div className="flex items-center gap-2">
            <label className="btn btn-secondary font-mono text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
              <Upload size={11} />
              {receiptFile ? receiptFile.name.slice(0, 20) + '...' : 'Upload File'}
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {receiptFile && (
              <button type="button" onClick={() => setReceiptFile(null)} className="text-brand-300 hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Splits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">Splits</label>
            <button type="button" onClick={handleEqualSplit} className="text-[10px] font-mono text-brand-500 hover:text-brand-900 underline">
              Split Equally
            </button>
          </div>
          {splits.map((s, i) => (
            <div key={s.userId} className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-600 w-28 truncate">{s.name}</span>
              <input
                type="number"
                value={s.amountCents}
                onChange={(e) => handleSplitChange(i, e.target.value)}
                placeholder="0"
                className="input font-mono text-sm flex-1"
                min={0}
              />
              <span className="text-[10px] font-mono text-brand-300">¢</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary font-mono text-xs uppercase tracking-wider disabled:opacity-40">
            {busy ? (uploading ? 'Uploading...' : 'Saving...') : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
