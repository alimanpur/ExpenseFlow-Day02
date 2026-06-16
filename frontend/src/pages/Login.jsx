import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Min 2 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isRegister, setIsRegister] = useState(false);

  const schema = isRegister ? registerSchema : loginSchema;
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: isRegister ? authService.register : authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(isRegister ? 'Account provisioned.' : 'Authentication verified.');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Authentication failed.');
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  const toggle = () => { setIsRegister((v) => !v); reset(); };

  return (
    <div className="min-h-screen bg-bg-muted flex items-center justify-center font-sans">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={16} className="text-brand-900" strokeWidth={2.5} />
            <span className="font-mono font-bold tracking-tight text-brand-900 text-sm">EXPENSEFLOW </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-brand-900">
            {isRegister ? 'Provision Account' : 'Authenticate'}
          </h1>
          <p className="text-xs text-brand-400 font-mono">
            {isRegister
              ? 'Register operator credentials to access ledger.'
              : 'Enter credentials to access the platform.'}
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider block font-mono">
                  Display Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Your name"
                  className="input font-mono text-sm"
                  autoComplete="name"
                />
                {errors.name && <p className="text-[10px] font-mono text-red-500">{errors.name.message}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider block font-mono">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="operator@domain.com"
                className="input font-mono text-sm"
                autoComplete="email"
              />
              {errors.email && <p className="text-[10px] font-mono text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider block font-mono">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="input font-mono text-sm"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {errors.password && <p className="text-[10px] font-mono text-red-500">{errors.password.message}</p>}
            </div>

            {mutation.isError && (
              <p className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                // Error: {mutation.error?.response?.data?.message || 'Request failed.'}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary w-full font-mono uppercase tracking-wider text-xs py-2.5 disabled:opacity-40"
            >
              {mutation.isPending
                ? '// Verifying...'
                : isRegister
                  ? 'Provision Account'
                  : 'Authenticate'}
            </button>
          </form>
        </div>

        <p className="text-center text-[15px] font-mono text-brand-400">
          {isRegister ? 'Already provisioned?' : 'No account?'}{' '}
          <button onClick={toggle} className="font-bold text-brand-900 hover:underline cursor-pointer">
            {isRegister ? 'Authenticate' : 'Register'}
          </button>
        </p>

        <p className="text-center text-[10px] font-mono text-brand-200">
          v2.0.0
        </p>
      </div>
    </div>
  );
}
