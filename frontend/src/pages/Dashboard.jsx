import { useAuthStore } from '../store/authStore';
import KPIGrid from '../components/dashboard/KPIGrid';
import VelocityChart from '../components/dashboard/VelocityChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import PendingSettlements from '../components/dashboard/PendingSettlements';
import QuickActions from '../components/dashboard/QuickActions';
import TopSpendingCategory from '../components/dashboard/TopSpendingCategory';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-brand-900 pb-12">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Net Ledger Dashboard</h2>
          <p className="text-xs text-brand-500 mt-0.5 font-mono">
            Real-time settlement velocities and expense balances.
            {user?.name && <span className="text-brand-300 ml-2">// Operator: {user.name}</span>}
          </p>
        </div>
      </div>

      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VelocityChart />
        </div>
        <div className="space-y-4">
          <QuickActions />
          <TopSpendingCategory />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PendingSettlements />
        </div>
        <ActivityFeed />
      </div>

      <RecentExpenses />
    </div>
  );
}
