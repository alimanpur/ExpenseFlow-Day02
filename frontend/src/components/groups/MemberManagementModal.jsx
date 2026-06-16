import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserMinus } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useAuthStore } from '../../store/authStore';
import Modal from '../ui/Modal';

export default function MemberManagementModal({ group, members, onClose }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: (userId) => groupService.removeMember(group.id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group-ledger', group.id] });
      toast.success('Member removed.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Remove failed.'),
  });

  const isOwner = group.ownerId === user?.id;

  return (
    <Modal title="// Member Management" onClose={onClose}>
      <div className="space-y-1 divide-y divide-border">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-xs font-semibold text-brand-900">
                {m.user?.name}
                {m.userId === user?.id && <span className="ml-1.5 text-[9px] font-mono text-brand-300">(you)</span>}
                {m.userId === group.ownerId && <span className="ml-1.5 text-[9px] font-mono text-brand-400 uppercase">owner</span>}
              </p>
              <p className="text-[10px] font-mono text-brand-400">{m.user?.email}</p>
            </div>
            {(isOwner || m.userId === user?.id) && m.userId !== group.ownerId && (
              <button
                onClick={() => removeMutation.mutate(m.userId)}
                disabled={removeMutation.isPending}
                className="text-brand-300 hover:text-red-500 transition-none p-1 disabled:opacity-40"
                title="Remove member"
              >
                <UserMinus size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">Close</button>
      </div>
    </Modal>
  );
}
