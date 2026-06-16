import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { settlementService } from '../../services/settlementService';
import Modal from '../ui/Modal';

const schema = z.object({
  groupId: z.string().min(1),
  receiverId: z.string().min(1, 'Select receiver'),
  amountCents: z.coerce.number().int().min(1, 'Amount required'),
});

export default function RecordSettlementModal({ groups, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { groupId: groups?.[0]?.id ?? '', receiverId: '', amountCents: '' },
  });

  const selectedGroupId = watch('groupId');
  const selectedGroup = groups?.find((g) => g.id === selectedGroupId);
  const members = selectedGroup?.members ?? [];

  const mutation = useMutation({
    mutationFn: settlementService.recordSettlement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements'] });
      qc.invalidateQueries({ queryKey: ['my-settlements'] });
      qc.invalidateQueries({ queryKey: ['settlement-rate'] });
      qc.invalidateQueries({ queryKey: ['group-ledger'] });
      qc.invalidateQueries({ queryKey: ['net-balance'] });
      toast.success('Settlement recorded. Awaiting receiver verification.');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to record.'),
  });

  return (
    <Modal title="// Log Manual Settlement" onClose={onClose}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Group</label>
          <select {...register('groupId')} className="input font-mono text-sm">
            {groups?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          {errors.groupId && <p className="text-[10px] font-mono text-red-500">{errors.groupId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Receiver</label>
          <select {...register('receiverId')} className="input font-mono text-sm">
            <option value="">— Select receiver —</option>
            {members.map((m) => <option key={m.userId} value={m.userId}>{m.user?.name ?? m.userId}</option>)}
          </select>
          {errors.receiverId && <p className="text-[10px] font-mono text-red-500">{errors.receiverId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Amount (cents)</label>
          <input type="number" {...register('amountCents')} placeholder="5000 = $50.00" className="input font-mono text-sm" min={1} />
          {errors.amountCents && <p className="text-[10px] font-mono text-red-500">{errors.amountCents.message}</p>}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary font-mono text-xs uppercase tracking-wider">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary font-mono text-xs uppercase tracking-wider disabled:opacity-40">
            {mutation.isPending ? 'Saving...' : 'Record Settlement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
