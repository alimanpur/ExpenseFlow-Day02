import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white border border-border w-full ${width} mx-4 shadow-none`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">{title}</span>
          <button onClick={onClose} className="text-brand-400 hover:text-brand-700 transition-none p-0.5">
            <X size={14} />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
