import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import Modal from '../ui/Modal';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function InviteMemberModal({ groupId, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ email }) => groupService.inviteMember(groupId, email),
    onSuccess: () => { toast.success('Invite sent.'); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Invite failed.'),
  });

  return (
    <Modal title="// Invite Participant" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">
            Email Address
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="member@domain.com"
            className="input font-mono text-sm"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-[10px] font-mono text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary font-mono text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn btn-primary font-mono text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {mutation.isPending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
