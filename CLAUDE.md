# CLAUDE.md — Nifty Options ICT Trade Journal

## What we're building
A personal trade & backtest journal for a solo ICT (Inner Circle Trader) options trader.
Single user. Online, deployed on Vercel, accessible from any device (laptop + phone).
Built around **Indian index options** (Nifty, BankNifty, Sensex) and **ICT session/killzone timing**.

This is NOT a generic trading journal. Its whole edge is:
1. Filtering performance by **ICT killzone/session** and **day of week**.
2. Tracking **rule adherence** and **mistakes/leaks** per trade.
3. Reporting **expectancy and profit factor** as the headline metric — NOT win rate.

Keep it lean. Do not add: options Greeks (delta/theta/vega), broker auto-sync,
multi-leg spread grouping, multi-user/auth beyond a simple password gate. These are
bloat for this user. If they're ever needed, they come later.

---

## Stack
- **Frontend:** React (Vite). Deploy on **Vercel**.
- **Backend/data + images:** **Supabase** (free tier) — Postgres for data, Storage bucket for screenshots.
- **Auth:** none needed functionally, but add ONE simple password gate (single shared password,
  since the app is on a public URL). Keep it minimal.
- **Charts:** Recharts.
- Everything must work on mobile screen widths (responsive).

---

## Data model (Supabase)

### `trades` table
- `id` (uuid, pk)
- `created_at` (timestamp)
- `trade_date` (date)
- `session` (text) — e.g. "London", "NY AM", "NY PM", "Asian" + user can add custom
- `instrument` (text) — "Nifty" / "BankNifty" / "Sensex" / custom (free entry, with those as quick picks)
- `option_type` (text) — "CE" / "PE"
- `strike` (numeric)
- `expiry` (date)
- `direction` (text) — "long" / "short"
- `entry_premium` (numeric)
- `exit_premium` (numeric)
- `stop` (numeric)
- `target` (numeric)
- `entry_time` (timestamp)
- `exit_time` (timestamp)
- `duration_seconds` (integer) — AUTO-CALCULATED from entry/exit time, do not ask user to type it
- `risk_r` (numeric) — R risked
- `outcome_r` (numeric) — R result (can be negative)
- `result` (text) — "win" / "loss" / "BE"
- `setup_name` (text) — filterable; the core analytical dimension
- `rules_checklist` (jsonb) — array of {rule: text, checked: bool} ticked at entry
- `rules_followed` (bool) — AUTO: true if every rule in checklist is checked
- `mistake_tag` (text) — user's leak, e.g. "chased", "moved stop", "no confirmation", "FOMO", "revenge", "early exit" + custom
- `emotion` (text) — simple free text / quick picks (calm, FOMO, revenge, confident)
- `note` (text) — trade-level note
- `custom_fields` (jsonb) — array of {name, value} so user can add ANY field on the fly (the "+ add anything")

### `images` table
- `id` (uuid, pk)
- `trade_id` (uuid, fk → trades.id)
- `url` (text) — Supabase Storage public URL
- `tags` (jsonb) — array of {text, color}; user types a tag, picks/gets a color, renders as colored chip
- `note` (text) — note per image (e.g. "4H bias", "15m entry sweep")
- `created_at` (timestamp)

Images stored in a Supabase Storage bucket `trade-screenshots`.

---

## Setups (important)
A "setup" is a named ICT model (e.g. "OTE in HTF OB", "Silver Bullet", "Turtle Soup").
Let the user define setups. Each setup can carry a **default rules checklist** that pre-fills
when logging a trade with that setup. Store setups in a `setups` table:
- `id`, `name`, `default_rules` (jsonb array of rule strings).

---

## Screens

### 1. Home / Dashboard (landing page)
Headline metrics as number cards at top:
- **Expectancy** (avg R per trade) — THE headline number
- **Profit Factor** (total R from wins / total R from losses)
- Win rate, total trades, total R, current streak

Charts below:
- **Equity curve** — cumulative R over time (line chart)
- **Win rate & avg R per setup** (bar chart, sortable)
- **Session / killzone breakdown** — R and win rate per session
- **Day-of-week breakdown** — R and win rate per weekday
- **Rules-followed vs rules-broken** — win rate & avg R comparison (this is a key behavioral metric)
- **Mistake/leak frequency** — bar chart of most common mistake_tags
- **Time-in-trade by outcome** — avg duration for wins vs losses

Filters that apply to the whole dashboard:
- Date range (this week / this month / all time / custom)
- By setup
- By instrument

### 2. Log Trade
Fast form with all `trades` fields.
- Duration auto-calculated from entry/exit time — never typed.
- `rules_followed` auto-derived from checklist.
- Selecting a setup pre-fills that setup's default rules checklist.
- Image input: multiple screenshots, each with editable colored tags + a note field.
  Support ALL of these input methods:
  - **Paste from clipboard (Ctrl+V / Cmd+V)** — user copies a chart screenshot and pastes it
    directly into the trade. This is the primary/fastest method for desktop backtesting — make it work well.
  - **Drag-and-drop** and standard **file picker** from PC.
  - **Camera roll / photo upload** from phone.
  On paste or drop, upload the image to the Supabase storage bucket and attach it to the trade.
- A **"+ add field"** button for custom_fields.

### 3. Trade List
- Table/list of trades, filterable by setup / instrument / session / result.
- Show thumbnail previews inline (not just filenames).
- Click a trade → detail.

### 4. Trade Detail
- Full trade data.
- **Image preview grid** (thumbnails) with click-to-enlarge **lightbox**. Each image shows its
  colored tags and its note. Images are the point — make them visible and easy to browse, never a plain column.

---

## Key calculations (get these right)
- `duration_seconds` = exit_time − entry_time.
- **Expectancy** = mean(outcome_r) across trades.
- **Profit Factor** = sum(outcome_r where >0) / abs(sum(outcome_r where <0)).
- **Win rate** = count(win) / count(all).
- `rules_followed` = all checklist items checked.
- Rules comparison = win rate & avg R for rules_followed=true vs false.
- Session/day breakdowns = group trades, compute win rate + sum(outcome_r) per group.

---

## Build order (do it in this sequence — do NOT build everything at once)
1. **Setup project**: Vite + React on Vercel, Supabase connected, password gate, schema + storage bucket created.
2. **Log Trade form + Trade List + Trade Detail** with image upload, previews, tags, per-image notes. Get logging solid first.
3. **Basic dashboard**: expectancy, profit factor, equity curve, session breakdown. (Enough to be useful with real data.)
4. **Full analytics**: rules-followed comparison, mistake/leak chart, day-of-week, time-in-trade. Build this AFTER the user has logged real trades and knows what they look at.

Ship steps 1–3 as v1. Step 4 is v2.

---

## Style / UX notes
- Clean, fast, dark-mode friendly (trader tool).
- Mobile-first responsive — user logs trades from phone.
- Logging a trade must be fast — minimal clicks.
- Images always shown as visual previews, never as text links or a column.
- Colored tags render as chips.

## Mobile UX requirements (must be genuinely good on phone, not just "nothing overflows")
- Fully responsive on both desktop and phone. On phone: dashboard charts stack vertically,
  the log form is single-column, the image grid reflows.
- **Easy phone image upload** — one tap to open camera roll / take photo and attach.
- **Big tap targets** on the Log Trade form — the user often logs a trade from their phone right
  after it closes, so minimize typing and use quick-pick buttons for instrument, CE/PE, session, result.
- **Simplify dense charts on small screens** — the equity curve is fine, but multi-dimensional
  breakdowns (session, day-of-week) should shrink or switch to a simpler mobile-friendly view
  rather than being squished. Don't just scale desktop charts down.

---

## Philosophy (why this exists — keep it in mind)
The user knows the trap: consuming more content instead of doing the reps.
This tool exists to force the reps — log trades, see the data, find the edge and the leaks.
So the features that matter most are the ones that expose truth: expectancy over win rate,
rules-followed vs broken, mistake frequency, and session/day filtering.
Everything else is secondary. Keep it lean, keep it honest, keep it fast to use.
