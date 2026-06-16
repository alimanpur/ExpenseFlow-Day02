import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, ArrowLeftRight, Users, AlertCircle } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { groupService } from '../../services/groupService';
import { SkeletonCard } from '../ui/Skeleton';

function fmt(cents) { return `$${(Math.abs(cents) / 100).toFixed(2)}`; }

export default function KPIGrid() {
  const { data: monthly, isLoading: l1 } = useQuery({ queryKey: ['monthly-spending'], queryFn: analyticsService.getMonthlySpending });
  const { data: rate, isLoading: l2 } = useQuery({ queryKey: ['settlement-rate'], queryFn: analyticsService.getSettlementRate });
  const { data: groups, isLoading: l3 } = useQuery({ queryKey: ['groups'], queryFn: groupService.listGroups });
  const { data: netBalance, isLoading: l4 } = useQuery({ queryKey: ['net-balance'], queryFn: analyticsService.getNetBalance });

  if (l1 || l2 || l3 || l4) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  const currentMonth = monthly?.at(-1)?.amountCents ?? 0;
  const prevMonth = monthly?.at(-2)?.amountCents ?? 0;
  const delta = prevMonth > 0 ? (((currentMonth - prevMonth) / prevMonth) * 100).toFixed(1) : null;
  const net = netBalance?.net ?? 0;

  const kpis = [
    {
      label: 'Monthly Throughput',
      val: `$${(currentMonth / 100).toFixed(2)}`,
      sub: delta != null ? `${delta > 0 ? '+' : ''}${delta}% vs last month` : 'Current month',
      icon: delta > 0 ? TrendingUp : TrendingDown,
      iconColor: delta > 0 ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'Net Balance',
      val: `${net >= 0 ? '+' : '-'}${fmt(net)}`,
      sub: net >= 0 ? `${fmt(netBalance?.totalOwedToMe)} owed to you` : `${fmt(netBalance?.totalIOwe)} you owe`,
      color: net >= 0 ? 'text-green-600' : 'text-red-500',
      icon: ArrowLeftRight,
      iconColor: net >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Active Group Nodes',
      val: `${groups?.length ?? 0}`,
      sub: 'Ledger pools joined',
      icon: Users,
      iconColor: 'text-brand-400',
    },
    {
      label: 'Resolution Efficiency',
      val: `${rate?.rate ?? 0}%`,
      sub: `${rate?.verified ?? 0} of ${rate?.total ?? 0} verified`,
      color: (rate?.rate ?? 0) >= 80 ? 'text-green-600' : 'text-amber-600',
      icon: AlertCircle,
      iconColor: (rate?.rate ?? 0) >= 80 ? 'text-green-500' : 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="card p-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">{kpi.label}</span>
              <Icon size={13} className={kpi.iconColor} />
            </div>
            <p className={`text-2xl font-bold font-mono tracking-tight ${kpi.color ?? 'text-brand-900'}`}>{kpi.val}</p>
            <span className="text-[10px] font-mono text-brand-400">{kpi.sub}</span>
          </div>
        );
      })}
    </div>
  );
}
