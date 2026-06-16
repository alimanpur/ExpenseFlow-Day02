import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Strategy:
//   1. Requests with no Origin header (server-to-server, curl) → always allow
//   2. Any *.vercel.app origin → always allow (covers all preview + production deployments)
//   3. Origins listed in CLIENT_URL env var (comma-separated) → allow
//   4. localhost on any port → allow in development
//   5. Everything else → block

const explicitOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
]);

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => explicitOrigins.add(o));
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true;                              // non-browser request
  if (origin.endsWith('.vercel.app')) return true;      // all Vercel URLs
  if (explicitOrigins.has(origin)) return true;         // localhost + CLIENT_URL list
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true; // any localhost port
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── BODY PARSERS ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString(), env: process.env.NODE_ENV })
);

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/settlements', settlementRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/upload', uploadRoutes);

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
