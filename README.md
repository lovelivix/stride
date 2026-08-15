# STRIDE 2.0

A family fitness app — progressive strength tracking for three people, three
tailored programmes, one shared codebase.

**Stack:** React + Vite · Supabase (auth + Postgres + storage) · Vercel

> **New here? Start with [`SETUP.md`](./SETUP.md)** — it walks through the
> Supabase / GitHub / Vercel steps end to end.

## What it does

- **Magic-link auth**, separate private profile + data per user.
- **Three programmes**: STRIDE Strength (Olivia), Foundations (Mum, GLP-1
  adapted, bone-loading, heart health), Maintain & Build (Husband, calisthenics).
- **Progressive overload** — weight/rep/hold/RPE tracking with a suggestion
  engine that tells you when to add load and by how much.
- **Home / Gym toggle** that swaps every exercise to the right variant for your
  equipment, mid-workout.
- **Smart daily suggestion** based on your recent history, weekly volume and RPE.
- **Calf finisher** baked into every lower-body day; optional post-workout
  **mobility** add-ons; shared **cardio / HIIT** timers.
- **Body stats** log with weight chart + private progress photos.
- **Walk habit tracker** on the Today screen.
- **Post-workout summary** with volume vs last time and PR detection.

## Run locally

```bash
npm install
cp .env.example .env    # then paste your Supabase URL + anon key
npm run dev
```

## Project structure

```
src/
  data/         exercises, programmes, alternative/equipment resolution
  lib/          supabase client, auth, progression + suggestion engines, workout builder
  components/   workout (Timer, SetLogger, ExerciseCard, WorkoutSummary) + layout (BottomNav)
  pages/        Login, Onboarding, Today, Programme, ActiveWorkout, History, Progress, Profile, TimedSession
supabase/
  schema.sql    run once in the Supabase SQL editor
```

## Editing the plan

`src/data/exercises.js` and `src/data/programmes.js` are the source of truth.
Add an exercise to `EXERCISES`, reference its `id` in a programme day, and it
flows through the workout builder, logger, history and progression engine
automatically.
