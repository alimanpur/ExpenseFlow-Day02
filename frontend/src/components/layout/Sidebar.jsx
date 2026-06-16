import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, ArrowLeftRight, Settings, Zap, X } from 'lucide-react';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Settlements', path: '/settlements', icon: ArrowLeftRight },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-60 bg-white border-r border-border h-screen flex flex-col justify-between select-none">
      <div>
        <div className="h-14 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Zap size={18} className="text-brand-900" strokeWidth={2.5} />
            <span className="font-mono font-bold tracking-tight text-brand-900 text-xl">EXPENSEFLOW </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-brand-400 hover:text-brand-700 p-0.5">
              <X size={13} />
            </button>
          )}
        </div>
        <nav className="p-3 space-y-0.5">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium tracking-wide border transition-none ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 border-border font-semibold'
                    : 'text-brand-400 border-transparent hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <p className="text-[10px] font-mono text-brand-300 tracking-wider"></p>
        <p className="text-[10px] font-mono text-brand-200 mt-0.5">ExpenseFlow v2.0.0</p>
      </div>
    </aside>
  );
}
