import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { groupService } from '../../services/groupService';
import Modal from '../ui/Modal';

export default function DeleteGroupModal({ group, onClose, onDeleted }) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState('');

  const mutation = useMutation({
    mutationFn: () => groupService.deleteGroup(group.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success(`"${group.name}" deleted.`);
      onDeleted?.();
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Deletion failed.'),
  });

  return (
    <Modal title="// Delete Group" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 p-3 flex gap-2.5">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-red-700">
            This will permanently delete <strong>{group.name}</strong> and all its expenses, settlements, and activity.
            This cannot be undone.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">
            Type <span className="text-brand-900">{group.name}</span> to confirm
          </label>
          <input
            className="input font-mono text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={group.name}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={confirm !== group.name || mutation.isPending}
            className="btn btn-danger font-mono text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete Group'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
