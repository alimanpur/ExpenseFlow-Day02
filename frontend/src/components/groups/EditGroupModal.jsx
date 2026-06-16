import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import Modal from '../ui/Modal';

export default function EditGroupModal({ group, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: group.name ?? '',
    description: group.description ?? '',
    currency: group.currency ?? 'USD',
  });

  const mutation = useMutation({
    mutationFn: () => groupService.updateGroup(group.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['group-ledger', group.id] });
      toast.success('Group updated.');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed.'),
  });

  return (
    <Modal title="// Edit Group" onClose={onClose}>
      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Group Name</label>
          <input
            className="input font-mono text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Description</label>
          <input
            className="input font-mono text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Currency</label>
          <select
            className="input font-mono text-sm"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          >
            {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary font-mono text-xs uppercase tracking-wider disabled:opacity-40">
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
