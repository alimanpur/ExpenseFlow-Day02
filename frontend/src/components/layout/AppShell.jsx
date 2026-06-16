import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { Menu, X } from 'lucide-react';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex antialiased">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen z-50 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-h-screen lg:ml-60">
        {/* Mobile menu button inside topbar area */}
        <div className="lg:hidden fixed top-0 left-0 z-30 h-14 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-brand-400 hover:text-brand-700 border border-border bg-white"
            aria-label="Open menu"
          >
            <Menu size={14} />
          </button>
        </div>

        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-bg-muted overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
