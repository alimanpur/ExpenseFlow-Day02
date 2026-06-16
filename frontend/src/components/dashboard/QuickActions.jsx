import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeftRight, BarChart2, Users } from 'lucide-react';

const actions = [
  { label: 'New Expense', icon: Plus, path: '/groups', color: 'bg-brand-900 text-white border-brand-900 hover:bg-brand-800' },
  { label: 'Settlements', icon: ArrowLeftRight, path: '/settlements', color: 'bg-white text-brand-900 border-border hover:bg-brand-50' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics', color: 'bg-white text-brand-900 border-border hover:bg-brand-50' },
  { label: 'Groups', icon: Users, path: '/groups', color: 'bg-white text-brand-900 border-border hover:bg-brand-50' },
];

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">
        // Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon, path, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`btn text-xs font-mono uppercase tracking-wider flex items-center gap-2 py-2.5 ${color}`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
