-- ══════════════════════════════════════════════════════════════════════
-- STRIDE 2.0 — Supabase schema
-- Run this ENTIRE file once in the Supabase SQL Editor (SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / idempotent policy drops.
-- ══════════════════════════════════════════════════════════════════════

-- ── PROFILES ──────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  goal_types text[],                 -- ['lose_weight','build_muscle','get_fitter','heart_health']
  programme_id text,
  current_week integer default 1,
  location_default text default 'home',
  equipment_home text[],             -- ['bodyweight','4kg','8kg','12kg','bands']
  equipment_gym text[],              -- ['dumbbells','barbells','cables','machines','smith']
  is_glp1 boolean default false,
  height_cm integer,
  created_at timestamptz default now()
);

-- ── BODY STATS ────────────────────────────────────────────────────────
create table if not exists body_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  logged_at timestamptz default now(),
  weight_kg decimal(5,2),
  waist_cm decimal(5,2),
  hips_cm decimal(5,2),
  arms_cm decimal(5,2),
  photo_url text,
  notes text
);

-- ── GOALS ─────────────────────────────────────────────────────────────
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  description text,
  target_value decimal,
  target_unit text,
  deadline date,
  achieved boolean default false,
  created_at timestamptz default now()
);

-- ── SESSIONS (each completed workout) ─────────────────────────────────
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  workout_id text not null,          -- `${programme_id}_${day}` e.g. stride_strength_A
  programme_id text not null,
  completed_at timestamptz default now(),
  duration_mins integer,
  location text,
  rpe integer check (rpe between 1 and 10),
  notes text,
  total_volume_kg decimal
);

-- ── SESSION SETS (tracked data per set) ───────────────────────────────
create table if not exists session_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  exercise_id text not null,         -- stable BASE exercise id (e.g. goblet_squat)
  exercise_name text not null,       -- resolved display name for the variant used
  set_number integer not null,
  weight_kg decimal(6,2),
  reps integer,
  hold_secs integer,
  completed boolean default true,
  is_pr boolean default false,
  alternative_used text,             -- variant id when different from base (e.g. goblet_squat_12kg)
  logged_at timestamptz default now()
);

-- Helpful indexes for history / progression lookups
create index if not exists idx_sessions_user_time on sessions (user_id, completed_at desc);
create index if not exists idx_sets_user_exercise on session_sets (user_id, exercise_id, logged_at desc);
create index if not exists idx_body_stats_user_time on body_stats (user_id, logged_at);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────
alter table profiles enable row level security;
alter table body_stats enable row level security;
alter table goals enable row level security;
alter table sessions enable row level security;
alter table session_sets enable row level security;

drop policy if exists "own profile" on profiles;
drop policy if exists "own body_stats" on body_stats;
drop policy if exists "own goals" on goals;
drop policy if exists "own sessions" on sessions;
drop policy if exists "own sets" on session_sets;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own body_stats" on body_stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goals" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions" on sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sets" on session_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── STORAGE for progress photos (private bucket) ──────────────────────
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "own photos" on storage.objects;
create policy "own photos" on storage.objects for all
using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
