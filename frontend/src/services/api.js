import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Resolution order:
// 1. VITE_API_URL env var (set in Vercel dashboard or .env.local for dev)
// 2. .env.production baked value (committed fallback for Vercel builds)
// 3. Hardcoded Render URL (last resort — should never be reached in production)
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://expenseflow-day02.onrender.com/api/v1';

if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[ExpenseFlow] VITE_API_URL not found in .env.local — using fallback Render URL.\n' +
    'Create frontend/.env.local with: VITE_API_URL=https://expenseflow-day02.onrender.com/api/v1'
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
  withCredentials: false,
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Normalise errors; auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    const serverMsg =
      err.response?.data?.message ||
      err.response?.data?.error?.message;
    if (serverMsg) err.message = serverMsg;
    return Promise.reject(err);
  }
);

export default api;
