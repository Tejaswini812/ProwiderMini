# Prowider Mini — Lead Distribution System

Next.js (App Router) + **PostgreSQL** + Prisma. Implements the full assignment: lead capture, mandatory + fair allocation, quotas, concurrency-safe transactions, dashboard polling, and idempotent webhook.

## Live demo

**Demo:** `https://YOUR-DEPLOYMENT.example` (deploy to Vercel + Neon/Supabase Postgres)

---

## Quick start (local)

### 1. Install dependencies

```bash
npm install
```

### 2. PostgreSQL database (pick one)

**Option A — Docker (recommended if installed)**

```bash
npm run db:up
```

**Option B — Free cloud DB (no Docker)**  
Create a database on [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy the connection string.

**Option C — Local PostgreSQL**  
Install PostgreSQL and create a database named `prowider_leads`.

### 3. Configure `.env`

```bash
# Copy example and edit DATABASE_URL
cp .env.example .env
```

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prowider_leads"
```

> Do **not** use `prisma+postgres://` unless you run Prisma's local dev server. Use a normal `postgresql://` URL.

### 4. Create tables + seed data

```bash
npm run setup
```

This runs `prisma db push` and seeds 3 services, 8 providers, and fair-allocation cursors.

### 5. Run the app

```bash
npm run dev
```

Open **http://localhost:3000** (use the port shown in the terminal).

| Route | Purpose |
|-------|---------|
| `/` | Home + assignment overview |
| `/request-service` | Customer lead form |
| `/dashboard` | Provider quotas & assignments (polls every 2.5s) |
| `/test-tools` | Webhook + concurrency tests |
| `/api/health` | DB connection check |

---

## Assignment checklist

| Requirement | Status |
|-------------|--------|
| Next.js frontend | Yes |
| PostgreSQL persistence | Yes (Prisma) |
| `/request-service` form (all fields) | Yes |
| Duplicate phone + same service blocked at DB | Yes (`@@unique([phone, serviceId])`) |
| Exactly 3 providers per lead | Yes |
| Mandatory rules (S1→P1, S2→P5, S3→P1+P4) | Yes |
| Fair round-robin pools (not random) | Yes, persisted in `FairAllocationState` |
| Monthly quota 10 per provider | Yes |
| Concurrency-safe allocation | Yes (Serializable tx + `FOR UPDATE` + retries) |
| `/dashboard` real data + auto refresh | Yes (polling 2.5s) |
| `/test-tools` webhook + idempotency + 10 parallel leads | Yes |
| Quota reset **only** via webhook | Yes |
| Seed: 3 services, 8 providers | Yes (`npm run setup`) |

---

## Allocation algorithm

1. **Mandatory providers** (if quota available): S1→1, S2→5, S3→1+4  
2. **Fair pool** (fixed order, round-robin cursor in DB): S1→[2,3,4], S2→[6,7,8], S3→[2,3,5,6,7,8]  
3. Pick until **3 providers** total; skip at-quota or already-chosen  
4. Persist new cursor; increment `leadsAssignedInPeriod`  
5. If 3 cannot be assigned → transaction rolls back (no orphan lead)

## Concurrency

- Lead + assignment in one **Serializable** transaction  
- `SELECT … FOR UPDATE` on providers 1–8 and fair cursor row  
- Retries on Prisma `P2034` serialization failures  

## Webhook idempotency

- `POST /api/webhook/subscription` requires `Idempotency-Key` header  
- Inserts into `ProcessedWebhookEvent` then resets all providers' `leadsAssignedInPeriod` to 0  
- Duplicate key → `200` with `{ duplicate: true }`, no second reset  

---

## Troubleshooting

**Buttons return errors / dashboard empty**

1. Check health: `http://localhost:3000/api/health`  
2. Must show `"ok": true, "seeded": true`  
3. If not: fix `DATABASE_URL`, then run `npm run setup`  
4. Restart dev server after changing `.env`  

**404 or wrong port**

- Only run **one** `npm run dev`  
- Use the URL from the terminal (e.g. `localhost:3000` or `3001`)  

**Clear build cache**

```bash
Remove-Item -Recurse -Force .next
npm run dev
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run setup` | `db push` + seed |
| `npm run db:up` | Start Docker Postgres |
| `npm run db:seed` | Seed only |
