-- Nifty Options ICT Trade Journal — Supabase schema
-- Run this in the Supabase SQL editor for a new project.

create extension if not exists "pgcrypto";

-- Generated columns can't contain subqueries directly, so the "every rule
-- checked" check lives in an immutable function instead.
create or replace function rules_all_checked(checklist jsonb)
returns boolean
language sql
immutable
as $$
  select case
    when jsonb_array_length(checklist) = 0 then null
    else not exists (
      select 1 from jsonb_array_elements(checklist) elem
      where (elem->>'checked')::boolean is not true
    )
  end
$$;

-- ─────────────────────────────────────────────
-- setups: named ICT models, each with a default rules checklist
-- ─────────────────────────────────────────────
create table if not exists setups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  default_rules jsonb not null default '[]'::jsonb -- array of rule strings
);

-- ─────────────────────────────────────────────
-- trades
-- ─────────────────────────────────────────────
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  trade_date date not null,
  session text,
  instrument text,
  option_type text check (option_type in ('CE', 'PE')),
  strike numeric,
  expiry date,
  direction text check (direction in ('long', 'short')),

  entry_premium numeric,
  exit_premium numeric,
  stop numeric,
  target numeric,

  entry_time timestamptz,
  exit_time timestamptz,
  duration_seconds integer generated always as (
    case
      when entry_time is not null and exit_time is not null
      then extract(epoch from (exit_time - entry_time))::integer
      else null
    end
  ) stored,

  risk_r numeric,
  outcome_r numeric,
  result text check (result in ('win', 'loss', 'BE')),

  setup_name text,

  rules_checklist jsonb not null default '[]'::jsonb, -- [{rule, checked}]
  rules_followed boolean generated always as (rules_all_checked(rules_checklist)) stored,

  mistake_tag text,
  emotion text,
  note text,
  custom_fields jsonb not null default '[]'::jsonb -- [{name, value}]
);

create index if not exists idx_trades_trade_date on trades (trade_date desc);
create index if not exists idx_trades_setup_name on trades (setup_name);
create index if not exists idx_trades_session on trades (session);
create index if not exists idx_trades_instrument on trades (instrument);

-- ─────────────────────────────────────────────
-- images: screenshots attached to a trade
-- ─────────────────────────────────────────────
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades(id) on delete cascade,
  url text not null,
  tags jsonb not null default '[]'::jsonb, -- [{text, color}]
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_images_trade_id on images (trade_id);

-- ─────────────────────────────────────────────
-- Row Level Security — single-user app behind an app-level password gate,
-- accessed only via the anon key, so allow full CRUD to anon.
-- ─────────────────────────────────────────────
alter table trades enable row level security;
alter table images enable row level security;
alter table setups enable row level security;

drop policy if exists "anon full access" on trades;
create policy "anon full access" on trades for all using (true) with check (true);

drop policy if exists "anon full access" on images;
create policy "anon full access" on images for all using (true) with check (true);

drop policy if exists "anon full access" on setups;
create policy "anon full access" on setups for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- Storage bucket for screenshots
-- Create bucket "trade-screenshots" as PUBLIC in Supabase Dashboard > Storage,
-- or run:
-- insert into storage.buckets (id, name, public) values ('trade-screenshots', 'trade-screenshots', true)
-- on conflict (id) do nothing;
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', true)
on conflict (id) do nothing;

drop policy if exists "public read trade-screenshots" on storage.objects;
create policy "public read trade-screenshots" on storage.objects
  for select using (bucket_id = 'trade-screenshots');

drop policy if exists "anon upload trade-screenshots" on storage.objects;
create policy "anon upload trade-screenshots" on storage.objects
  for insert with check (bucket_id = 'trade-screenshots');

drop policy if exists "anon delete trade-screenshots" on storage.objects;
create policy "anon delete trade-screenshots" on storage.objects
  for delete using (bucket_id = 'trade-screenshots');

-- Seed a couple of starter setups (edit / delete freely from the app)
insert into setups (name, default_rules) values
  ('OTE in HTF OB', '["HTF bias confirmed", "Liquidity swept", "MSS on entry TF", "Entry in OTE (62-79%)", "Confluence with OB/FVG"]'::jsonb),
  ('Silver Bullet', '["Within Silver Bullet window", "Liquidity swept pre-window", "MSS on 1m/5m", "Entry FVG present"]'::jsonb),
  ('Turtle Soup', '["Prior swing high/low identified", "False breakout confirmed", "Reversal candle close back inside range"]'::jsonb)
on conflict (name) do nothing;
