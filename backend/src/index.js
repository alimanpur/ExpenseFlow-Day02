import app from './app.js';
import { seedCategories } from './config/seed.js';

// ── Startup environment validation ────────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[ExpenseFlow] FATAL: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`[ExpenseFlow] API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`[ExpenseFlow] CORS: localhost:* + *.vercel.app + CLIENT_URL=${process.env.CLIENT_URL || 'not set'}`);
  await seedCategories().catch((e) => console.warn('[ExpenseFlow] Category seed skipped:', e.message));
});
