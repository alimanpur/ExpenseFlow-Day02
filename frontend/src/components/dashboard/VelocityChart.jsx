import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { Skeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border p-2.5 font-mono text-[11px]">
      <p className="font-bold text-brand-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${(Number(p.value) / 100).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function VelocityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['monthly-spending'],
    queryFn: analyticsService.getMonthlySpending,
  });

  return (
    <div className="lg:col-span-2 card p-5 space-y-4">
      <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
        // Monthly Expense Velocity Curve
      </h3>
      <div className="h-60 w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : !data?.length ? (
          <EmptyState message="No spending data available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="month"
                stroke="#737373"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }}
              />
              <YAxis
                stroke="#737373"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono Variable' }}
                tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              />
              <Tooltip content={<TooltipContent />} />
              <Area
                type="monotone"
                dataKey="amountCents"
                name="Expenses"
                stroke="#171717"
                fillOpacity={0.04}
                fill="#171717"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
