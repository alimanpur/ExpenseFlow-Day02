import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { groupService } from '../services/groupService';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const PIE_COLORS = ['#0a0a0a', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border p-2.5 font-mono text-[11px] shadow-none">
      {label && <p className="font-bold text-brand-700 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? '#0a0a0a' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${(p.value / 100).toFixed(2)}` : p.value}
          {p.payload?.forecast ? ' (forecast)' : ''}
        </p>
      ))}
    </div>
  );
};

function fmt(cents) { return `$${(Math.abs(cents) / 100).toFixed(2)}`; }

export default function Analytics() {
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.listGroups,
  });

  useEffect(() => {
    if (!selectedGroupId && groups[0]?.id) setSelectedGroupId(groups[0].id);
  }, [groups, selectedGroupId]);

  const activeGroupId = selectedGroupId || groups[0]?.id;

  const { data: monthly = [], isLoading: l1 } = useQuery({ queryKey: ['monthly-spending'], queryFn: analyticsService.getMonthlySpending });
  const { data: categories = [], isLoading: l2 } = useQuery({ queryKey: ['category-spending'], queryFn: analyticsService.getCategorySpending });
  const { data: rate, isLoading: l3 } = useQuery({ queryKey: ['settlement-rate'], queryFn: analyticsService.getSettlementRate });
  const { data: debtors = [], isLoading: l4 } = useQuery({ queryKey: ['group-debtors', activeGroupId], queryFn: () => analyticsService.getGroupDebtors(activeGroupId), enabled: !!activeGroupId });
  const { data: creditors = [], isLoading: l5 } = useQuery({ queryKey: ['group-creditors', activeGroupId], queryFn: () => analyticsService.getGroupCreditors(activeGroupId), enabled: !!activeGroupId });
  const { data: health } = useQuery({ queryKey: ['group-health', activeGroupId], queryFn: () => analyticsService.getGroupHealth(activeGroupId), enabled: !!activeGroupId });
  const { data: forecastData, isLoading: l6 } = useQuery({ queryKey: ['spending-forecast'], queryFn: analyticsService.getSpendingForecast });
  const { data: groupComparison = [], isLoading: l7 } = useQuery({ queryKey: ['group-comparison'], queryFn: analyticsService.getGroupComparison });
  const { data: memberData = [], isLoading: l8 } = useQuery({ queryKey: ['member-comparison', activeGroupId], queryFn: () => analyticsService.getMemberComparison(activeGroupId), enabled: !!activeGroupId });

  const totalSpend = monthly.reduce((a, c) => a + (c.amountCents ?? 0), 0);
  const totalCat = categories.reduce((a, c) => a + (c.amountCents ?? 0), 0) || 1;

  // Merge actual + forecast for trend chart
  const trendData = [
    ...monthly.map((m) => ({ ...m, forecast: false })),
    ...(forecastData?.forecast ?? []),
  ];

  const summaryKpis = [
    { label: 'Total Expenses (6M)', val: `$${(totalSpend / 100).toFixed(2)}`, sub: 'All groups' },
    { label: 'Settlement Rate', val: `${rate?.rate ?? 0}%`, sub: `${rate?.verified ?? 0}/${rate?.total ?? 0} verified`, color: (rate?.rate ?? 0) >= 80 ? 'text-green-600' : 'text-amber-600' },
    { label: 'Group Expenses', val: `${health?.expenseCount ?? 0}`, sub: `${health?.memberCount ?? 0} members` },
    { label: 'Forecast Trend', val: forecastData?.trend ?? '—', sub: `±$${((Math.abs(forecastData?.slope ?? 0)) / 100).toFixed(0)}/mo`, color: forecastData?.trend === 'decreasing' ? 'text-green-600' : forecastData?.trend === 'increasing' ? 'text-red-500' : 'text-brand-900' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-brand-900 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Predictive Analytics Core</h2>
          <p className="text-xs text-brand-500 mt-0.5 font-mono">Statistical dispersion curves, categorical modeling, and participant variance analysis.</p>
        </div>
        {loadingGroups ? <Skeleton className="h-8 w-48 rounded" /> : (
          <select value={activeGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="input font-mono text-xs w-56">
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {l1 || l3 || l6 ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          summaryKpis.map((k) => (
            <div key={k.label} className="card p-4 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">{k.label}</span>
              <p className={`text-2xl font-bold font-mono tracking-tight ${k.color ?? 'text-brand-900'}`}>{k.val}</p>
              <span className="text-[10px] font-mono text-brand-400">{k.sub}</span>
            </div>
          ))
        )}
      </div>

      {/* Spending Trend + Forecast */}
      <div className="card p-5 space-y-4">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
          // Monthly Expense Velocity + Forecast
        </h3>
        <div className="h-60">
          {l1 || l6 ? <Skeleton className="w-full h-full" /> : !trendData.length ? (
            <EmptyState message="No monthly data." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#737373" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#737373" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                <Tooltip content={<ChartTooltip />} />
                {monthly.length > 0 && (
                  <ReferenceLine x={monthly[monthly.length - 1]?.month} stroke="#e5e5e5" strokeDasharray="4 4" label={{ value: 'now', fontSize: 9, fontFamily: 'JetBrains Mono Variable', fill: '#a3a3a3' }} />
                )}
                <Area type="monotone" dataKey="amountCents" name="Actual" stroke="#0a0a0a" fill="url(#colorActual)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        {forecastData?.trend && forecastData.trend !== 'insufficient_data' && (
          <p className="text-[10px] font-mono text-brand-400">
            Trend: <span className={`font-bold ${forecastData.trend === 'decreasing' ? 'text-green-600' : forecastData.trend === 'increasing' ? 'text-red-500' : 'text-brand-600'}`}>{forecastData.trend.toUpperCase()}</span>
            {' · '}Baseline: ${((forecastData.baselineCents ?? 0) / 100).toFixed(2)}/mo
          </p>
        )}
      </div>

      {/* Category Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Volumetric Cost Categorization</h3>
          <div className="h-56">
            {l2 ? <Skeleton className="w-full h-full" /> : !categories.length ? <EmptyState message="No category data." /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="category" stroke="#737373" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable' }} />
                  <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amountCents" name="Amount" fill="#0a0a0a" radius={[2, 2, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Category Distribution</h3>
          {l2 ? <Skeleton className="w-full h-48" /> : !categories.length ? <EmptyState message="No categories." /> : (
            <>
              <div className="h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="amountCents" nameKey="category" cx="50%" cy="50%" innerRadius={32} outerRadius={58} strokeWidth={1} stroke="#e5e5e5">
                      {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`$${(v / 100).toFixed(2)}`, '']} contentStyle={{ fontFamily: 'JetBrains Mono Variable', fontSize: 10, border: '1px solid #e5e5e5' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {categories.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-brand-500 truncate">{cat.category}</span>
                    </div>
                    <span className="font-bold text-brand-900 shrink-0 ml-2">{Math.round((cat.amountCents / totalCat) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Member Comparison */}
      <div className="card p-5 space-y-4">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
          // Participant Paid vs Owed — {groups.find((g) => g.id === activeGroupId)?.name}
        </h3>
        <div className="h-52">
          {l8 ? <Skeleton className="w-full h-full" /> : !memberData.length ? <EmptyState message="No member data." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} />
                <Bar dataKey="paidCents" name="Paid" fill="#0a0a0a" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="owedCents" name="Owed" fill="#a3a3a3" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Group Comparison */}
      <div className="card p-5 space-y-4">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Group Comparison — Total Spend</h3>
        <div className="h-48">
          {l7 ? <Skeleton className="w-full h-full" /> : !groupComparison.length ? <EmptyState message="No group data." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupComparison} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" stroke="#737373" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }} tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="totalCents" name="Total Spend" fill="#0a0a0a" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Group Health */}
      {health && (
        <div className="card p-5 space-y-3">
          <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
            // Group Health Metrics — {groups.find((g) => g.id === activeGroupId)?.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Expenses', val: health.expenseCount },
              { label: 'Members', val: health.memberCount },
              { label: 'Settlements', val: health.settlementCount },
              { label: 'Verified', val: health.verifiedCount },
              { label: 'Resolution Rate', val: `${health.settlementRate}%` },
            ].map((m) => (
              <div key={m.label} className="bg-brand-50 border border-border p-3 space-y-1">
                <span className="text-[10px] font-mono text-brand-400 uppercase tracking-widest block">{m.label}</span>
                <p className="text-xl font-bold font-mono text-brand-900">{m.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
