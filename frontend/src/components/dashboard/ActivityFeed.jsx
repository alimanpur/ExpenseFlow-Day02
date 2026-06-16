import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import { Skeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const typeColor = {
  expense_added: 'bg-brand-900',
  member_joined: 'bg-brand-400',
  settlement_verified: 'bg-green-500',
  group_created: 'bg-blue-500',
};

const typeLabel = {
  expense_added: 'Expense Added',
  member_joined: 'Member Joined',
  settlement_verified: 'Settlement Verified',
  group_created: 'Group Created',
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-activity'],
    queryFn: analyticsService.getUserActivity,
    refetchInterval: 60_000,
  });

  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
        // System Activity Log
      </h3>
      <div className="space-y-3 h-60 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-2 w-1/2 rounded" />
              </div>
            </div>
          ))
        ) : !data?.length ? (
          <EmptyState message="No recent activity." />
        ) : (
          data.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeColor[item.type] ?? 'bg-brand-300'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand-900 truncate">
                  {typeLabel[item.type] ?? item.type}
                  {item.meta?.description ? ` — ${item.meta.description}` : ''}
                  {item.meta?.groupName ? ` — ${item.meta.groupName}` : ''}
                </p>
                {item.group && (
                  <p className="text-[10px] text-brand-400 font-mono truncate">{item.group.name}</p>
                )}
                <p className="text-[10px] text-brand-300 font-mono">{relativeTime(item.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
