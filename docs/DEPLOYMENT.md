# ExpenseFlow AI — Production Deployment Checklist

## Architecture

```
Browser → Vercel (React SPA) → Render (Express API) → MongoDB Atlas
```

All API calls go directly from the browser to Render via `VITE_API_URL`.
The Vercel deployment never proxies API requests — it only serves the static frontend.

---

## Render Backend Setup

### Required Environment Variables (set in Render Dashboard → Environment)

| Variable              | Value                                          |
|-----------------------|------------------------------------------------|
| `NODE_ENV`            | `production`                                   |
| `DATABASE_URL`        | `mongodb+srv://...@cluster.mongodb.net/db`     |
| `JWT_SECRET`          | A strong random string (min 32 chars)          |
| `CLIENT_URL`          | Optional — `*.vercel.app` is auto-allowed      |
| `OPENROUTER_API_KEY`  | Your OpenRouter key (AI features)              |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name                   |
| `CLOUDINARY_API_KEY`  | Your Cloudinary API key                        |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret                   |

> **NOTE:** Do NOT set `PORT` — Render assigns it automatically.

### Build & Start Commands
- Build: `npm install && npx prisma generate`
- Start: `npm start` (runs `node src/index.js`)

### Health Check
- Path: `/health`
- Expected response: `{ "status": "ok", "ts": "...", "env": "production" }`

---

## Vercel Frontend Setup

### Required Environment Variables (set in Vercel Dashboard → Project → Settings → Environment Variables)

| Variable        | Value                                              | Environments        |
|-----------------|----------------------------------------------------|---------------------|
| `VITE_API_URL`  | `https://expenseflow-day02.onrender.com/api/v1`    | Production, Preview |

> **CRITICAL:** This must be set BEFORE deploying. Vite bakes env vars at build time.
> After setting this variable, trigger a new deployment.

### Deploy Command
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `frontend`

---

## CORS Configuration

The backend auto-allows these origins (no configuration needed):
- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)
- `http://localhost:3000`
- Any `http://localhost:<port>`
- All `*.vercel.app` domains (covers all preview + production Vercel URLs)

To add a custom domain, set `CLIENT_URL` on Render:
```
CLIENT_URL=https://yourdomain.com
```

Multiple custom domains (comma-separated):
```
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
```

---

## Root Cause of "Request Failed" in Production

**Problem:** The browser was calling `https://<vercel-domain>/api/...` (the Vercel frontend itself)
instead of the Render backend.

**Why:** Vite env vars are baked at build time. If `VITE_API_URL` is not set in the Vercel
dashboard before building, the fallback in `.env.production` is used. If that file was also
missing, axios had no baseURL and defaulted to relative URLs, which resolved to the Vercel domain.

**Fix applied:**
1. Created `frontend/.env.production` with the hardcoded Render URL as a committed fallback
2. Added `VITE_API_URL` to `frontend/vercel.json` `build.env` section
3. Hardened `api.js` to always use an absolute URL with a 3-tier resolution
4. Documented the Vercel dashboard env var requirement in this file

---

## Deployment Order

1. Deploy backend to Render first
2. Copy the Render service URL (e.g. `https://expenseflow-day02.onrender.com`)
3. Set `VITE_API_URL=https://expenseflow-day02.onrender.com/api/v1` in Vercel dashboard
4. Deploy frontend to Vercel
5. Verify: open `/health` on Render URL — should return `{ "status": "ok" }`
6. Verify: login on the Vercel URL — should succeed

---

## API Endpoint Reference

| Method | Path                                    | Auth | Description              |
|--------|-----------------------------------------|------|--------------------------|
| POST   | /api/v1/auth/register                   | No   | Register                 |
| POST   | /api/v1/auth/login                      | No   | Login                    |
| GET    | /api/v1/auth/me                         | Yes  | Get profile              |
| PUT    | /api/v1/auth/me                         | Yes  | Update profile           |
| PUT    | /api/v1/auth/password                   | Yes  | Change password          |
| PUT    | /api/v1/auth/settings                   | Yes  | Update settings          |
| GET    | /api/v1/auth/export                     | Yes  | Export all data          |
| DELETE | /api/v1/auth/account                    | Yes  | Delete account           |
| GET    | /api/v1/groups                          | Yes  | List groups              |
| POST   | /api/v1/groups/create                   | Yes  | Create group             |
| GET    | /api/v1/groups/:id                      | Yes  | Group ledger             |
| PUT    | /api/v1/groups/:id                      | Yes  | Update group             |
| DELETE | /api/v1/groups/:id                      | Yes  | Delete group             |
| POST   | /api/v1/groups/:id/invite               | Yes  | Invite member            |
| DELETE | /api/v1/groups/:id/members/:userId      | Yes  | Remove member            |
| POST   | /api/v1/groups/join                     | Yes  | Join group               |
| POST   | /api/v1/groups/invites/:token/accept    | Yes  | Accept invite            |
| POST   | /api/v1/expenses/manual                 | Yes  | Add expense              |
| DELETE | /api/v1/expenses/:id                    | Yes  | Delete expense           |
| GET    | /api/v1/expenses/categories             | Yes  | List categories          |
| POST   | /api/v1/expenses/categories             | Yes  | Add category             |
| POST   | /api/v1/settlements                     | Yes  | Record settlement        |
| GET    | /api/v1/settlements/mine                | Yes  | My settlements           |
| PATCH  | /api/v1/settlements/:id/verify          | Yes  | Verify settlement        |
| GET    | /api/v1/settlements/group/:groupId      | Yes  | Group settlements        |
| GET    | /api/v1/analytics/monthly               | Yes  | Monthly spending         |
| GET    | /api/v1/analytics/categories            | Yes  | Category spending        |
| GET    | /api/v1/analytics/settlement-rate       | Yes  | Settlement rate          |
| GET    | /api/v1/analytics/forecast              | Yes  | Spending forecast        |
| GET    | /api/v1/analytics/group-comparison      | Yes  | Group comparison         |
| GET    | /api/v1/analytics/net-balance           | Yes  | Net balance              |
| GET    | /api/v1/analytics/groups/:id/debtors    | Yes  | Group debtors            |
| GET    | /api/v1/analytics/groups/:id/creditors  | Yes  | Group creditors          |
| GET    | /api/v1/analytics/groups/:id/health     | Yes  | Group health             |
| GET    | /api/v1/analytics/groups/:id/members    | Yes  | Member comparison        |
| GET    | /api/v1/notifications                   | Yes  | List notifications       |
| PATCH  | /api/v1/notifications/read              | Yes  | Mark notifications read  |
| GET    | /api/v1/activity/me                     | Yes  | User activity feed       |
| GET    | /api/v1/activity/groups/:groupId        | Yes  | Group activity feed      |
| POST   | /api/v1/upload/receipt                  | Yes  | Upload receipt           |
| POST   | /api/v1/ai/parse-expense                | Yes  | AI parse (no save)       |
| POST   | /api/v1/ai/quick-add                    | Yes  | AI parse + save          |
