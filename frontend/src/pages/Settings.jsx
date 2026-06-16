import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertTriangle, Download, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { Skeleton } from '../components/ui/Skeleton';

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  currency: z.string(),
  language: z.string(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const defaultNotifs = { expenseAdded: true, settlementPending: true, settlementVerified: true, weeklyDigest: false };

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? defaultNotifs);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setUser(profile);
      if (profile.settings?.notifications) setNotifications(profile.settings.notifications);
    }
  }, [profile, setUser]);

  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: pErr }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', currency: user?.currency ?? 'USD', language: user?.language ?? 'en' },
  });

  const { register: regPwd, handleSubmit: hsPwd, formState: { errors: pwdErr }, reset: resetPwd } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (profile) resetProfile({ name: profile.name, email: profile.email, currency: profile.currency ?? 'USD', language: profile.language ?? 'en' });
  }, [profile, resetProfile]);

  const updateProfile = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => { setUser(data?.user ?? data); qc.setQueryData(['profile'], data?.user ?? data); toast.success('Profile updated.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed.'),
  });

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => { toast.success('Password updated.'); resetPwd(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Password change failed.'),
  });

  const updateSettings = useMutation({
    mutationFn: authService.updateSettings,
    onSuccess: (data) => { setUser(data?.user ?? data); toast.success('Preferences saved.'); },
    onError: () => toast.error('Failed to save preferences.'),
  });

  const deleteAccount = useMutation({
    mutationFn: () => authService.deleteAccount(deletePassword),
    onSuccess: () => { toast.success('Account deleted.'); logout(); window.location.href = '/login'; },
    onError: (e) => toast.error(e.response?.data?.message || 'Deletion failed.'),
  });

  const handleNotifChange = (key, checked) => {
    const updated = { ...notifications, [key]: checked };
    setNotifications(updated);
    updateSettings.mutate({ notifications: updated });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await authService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenseflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully.');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading && !user) {
    return <div className="space-y-4 max-w-3xl">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl font-sans text-brand-900 pb-12">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">Platform Parameters Configuration</h2>
        <p className="text-xs text-brand-500 mt-0.5 font-mono">Manage operator identities, notification routing, and security ciphers.</p>
      </div>

      {/* Profile */}
      <div className="card p-5 space-y-5">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Operator Identity Profile</h3>
        <form onSubmit={hsProfile((d) => updateProfile.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Display Name</label>
              <input type="text" {...regProfile('name')} className={`input font-mono text-sm ${pErr.name ? 'border-red-400' : ''}`} />
              {pErr.name && <p className="text-[10px] font-mono text-red-500">{pErr.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Email Address</label>
              <input type="email" {...regProfile('email')} className={`input font-mono text-sm ${pErr.email ? 'border-red-400' : ''}`} />
              {pErr.email && <p className="text-[10px] font-mono text-red-500">{pErr.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Currency</label>
              <select {...regProfile('currency')} className="input font-mono text-sm">
                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Language</label>
              <select {...regProfile('language')} className="input font-mono text-sm">
                {[['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['ja', '日本語'], ['zh', '中文']].map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={updateProfile.isPending} className="btn btn-primary font-mono text-xs uppercase tracking-wider px-5 disabled:opacity-40">
              {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-5 space-y-5">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Security Cipher Update</h3>
        <form onSubmit={hsPwd((d) => changePassword.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Current Password</label>
            <input type="password" {...regPwd('currentPassword')} className={`input font-mono text-sm ${pwdErr.currentPassword ? 'border-red-400' : ''}`} />
            {pwdErr.currentPassword && <p className="text-[10px] font-mono text-red-500">{pwdErr.currentPassword.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} {...regPwd('newPassword')} className={`input font-mono text-sm pr-8 ${pwdErr.newPassword ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowNewPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400">
                  {showNewPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              {pwdErr.newPassword && <p className="text-[10px] font-mono text-red-500">{pwdErr.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest block">Confirm Password</label>
              <input type="password" {...regPwd('confirmPassword')} className={`input font-mono text-sm ${pwdErr.confirmPassword ? 'border-red-400' : ''}`} />
              {pwdErr.confirmPassword && <p className="text-[10px] font-mono text-red-500">{pwdErr.confirmPassword.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={changePassword.isPending} className="btn btn-primary font-mono text-xs uppercase tracking-wider px-5 disabled:opacity-40">
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="card p-5 space-y-5">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Notification Routing Configuration</h3>
        <div className="space-y-4">
          {[
            { key: 'expenseAdded', label: 'Expense Added to Group', desc: 'Trigger on any new expense within your groups.' },
            { key: 'settlementPending', label: 'Settlement Pending Verification', desc: 'Alert when a settlement awaits your confirmation.' },
            { key: 'settlementVerified', label: 'Settlement Verified', desc: 'Confirmation when counterparty clears a settlement.' },
            { key: 'weeklyDigest', label: 'Weekly Ledger Digest', desc: 'Compiled weekly summary of all group activity.' },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={notifications[item.key] ?? false}
                  onChange={(e) => handleNotifChange(item.key, e.target.checked)}
                  disabled={updateSettings.isPending}
                  className="w-4 h-4 accent-brand-900 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-900 group-hover:text-brand-600">{item.label}</p>
                <p className="text-xs font-mono text-brand-400 mt-0.5">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="card p-5 space-y-4">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// Data Export</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-900">Export All Data</p>
            <p className="text-xs font-mono text-brand-400 mt-0.5">Download your groups, expenses, settlements and activity as JSON.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-secondary font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40"
          >
            <Download size={11} />
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* System Info
      <div className="card p-5 space-y-3">
        <h3 className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest border-b border-border pb-2">// System Runtime Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 text-xs font-mono">
          {[
            ['Platform Version', 'v2.0.0-prod'],
            ['Engine Stage', 'SYS_STAGE // CORE_PROD'],
            ['API Endpoint', 'localhost:5000/api/v1'],
            ['Auth Strategy', 'JWT // 7d expiry'],
            ['DB Provider', 'MongoDB Atlas'],
            ['ORM Layer', 'Prisma v6.16.3'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border py-2">
              <span className="text-brand-400">{k}</span>
              <span className="font-bold text-brand-700">{v}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Danger Zone */}
      <div className="card p-5 space-y-4 border-red-200">
        <h3 className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest border-b border-red-100 pb-2 flex items-center gap-1.5">
          <AlertTriangle size={11} /> Danger Zone — Destructive Operations
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-brand-900">Terminate Account</p>
            <p className="text-xs font-mono text-brand-400 mt-0.5 mb-3">Permanently deactivates credentials and all associated data. Enter your password to confirm.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password to confirm..."
                  className="input font-mono text-sm pr-8"
                />
                <button type="button" onClick={() => setShowDeletePassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400">
                  {showDeletePassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <button
                onClick={() => {
                  if (!deletePassword) return toast.error('Enter your password to confirm.');
                  deleteAccount.mutate();
                }}
                disabled={deleteAccount.isPending || !deletePassword}
                className="btn btn-danger font-mono text-xs uppercase tracking-wider whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                {deleteAccount.isPending ? 'Terminating...' : 'Terminate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
