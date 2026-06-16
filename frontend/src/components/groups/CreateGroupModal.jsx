import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import Modal from '../ui/Modal';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  description: z.string().optional(),
});

export default function CreateGroupModal({ onClose }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created.');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create group.'),
  });

  return (
    <Modal title="// Initialize New Group Node" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">
            Group Name
          </label>
          <input type="text" {...register('name')} placeholder="e.g. Office Lunches" className="input font-mono text-sm" />
          {errors.name && <p className="text-[10px] font-mono text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">
            Description (optional)
          </label>
          <input type="text" {...register('description')} placeholder="Brief description" className="input font-mono text-sm" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn btn-primary font-mono text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {mutation.isPending ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
