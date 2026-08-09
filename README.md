# Nifty Options ICT Trade Journal

Personal trade & backtest journal for Indian index options, built around ICT session/killzone timing.
Headline metrics: **expectancy** and **profit factor** — not win rate.

## Stack

- React + Vite, deployed on Vercel
- Supabase (Postgres + Storage) for data and screenshots
- Recharts for charts
- Single shared-password gate (no real auth)

## Setup

### 1. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This creates the
   `trades`, `images`, and `setups` tables, RLS policies, and the `trade-screenshots` storage bucket.
3. Grab your project URL and `anon` public key from **Project Settings → API**.

### 2. Configure environment variables

```
cp .env.example .env.local
```

Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_PASSWORD` — the single password used to unlock the app

### 3. Run locally

```
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same three env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_PASSWORD`)
   in the Vercel project settings.
4. Deploy. Framework preset: **Vite**.

## Notes

- The app talks to Supabase directly from the browser using the `anon` key. RLS policies in
  `schema.sql` grant full read/write to `anon` — this is intentional for a single-user tool behind
  the password gate, not a public multi-tenant setup. Don't reuse this schema for a shared app.
- `duration_seconds` and `rules_followed` are Postgres generated columns — never written to
  directly by the client.
- Build order followed `CLAUDE.md`: logging (form + list + detail + images) first, dashboard v1
  (expectancy, profit factor, equity curve, session breakdown) second, full analytics (rules
  comparison, mistake frequency, day-of-week, time-in-trade) third.
