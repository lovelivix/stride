# STRIDE 2.0 — Setup checklist

Everything Claude built is ready. These are the account steps only you can do
(they need your Supabase, GitHub and Vercel logins). It's the same flow as
LilEats — should feel familiar. Roughly 25 minutes end to end.

---

## 1. Create the Supabase project (~5 min)

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Name it `stride-app` (keep it separate from LilEats).
3. Choose a region close to you (e.g. London / EU West) and set a database password.
4. Wait for it to finish provisioning.

## 2. Run the database schema (~2 min)

1. In your new project: **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy the whole file, paste it in.
3. Click **Run**. You should see "Success". This creates all tables, security
   rules, and the private `progress-photos` storage bucket in one go.

## 3. Get your two keys into `.env` (~2 min)

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Open the `.env` file in this project and replace the placeholders:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
   ```

   > The anon key is safe to use in the browser — it only works alongside the
   > row-level security rules the schema set up. Never paste the **service_role**
   > key here. `.env` is gitignored so it won't be committed.

## 4. Turn on magic-link email (~2 min)

1. Supabase → **Authentication → Providers → Email**: make sure **Email** is
   enabled. (Magic links work out of the box — no password needed.)
2. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` for now (you'll swap this for your
     Vercel URL after deploying — see step 7).
   - **Redirect URLs**: add both `http://localhost:5173` and (later) your Vercel
     domain, e.g. `https://stride-xxxx.vercel.app`.

## 5. Run it locally (~3 min)

```bash
cd stride
npm install
npm run dev
```

Open the local URL it prints (usually http://localhost:5173). Enter your email,
click the magic link that lands in your inbox, and you'll go straight into
onboarding. Set yourself up as **Olivia → STRIDE Strength**.

## 6. Push to GitHub (~3 min)

1. Create an empty repo called `stride` on [github.com](https://github.com/new)
   (no README/gitignore — this project already has them).
2. From the `stride` folder:

   ```bash
   git init
   git add .
   git commit -m "STRIDE 2.0 initial build"
   git branch -M main
   git remote add origin https://github.com/<your-username>/stride.git
   git push -u origin main
   ```

## 7. Deploy to Vercel (~5 min)

1. On [vercel.com](https://vercel.com) → **Add New → Project** → import the
   `stride` repo. Framework preset auto-detects as **Vite**.
2. Before deploying, add the two environment variables (same values as your
   `.env`): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. You'll get a URL like `https://stride-xxxx.vercel.app`.
4. Go back to Supabase → **Authentication → URL Configuration** and set the
   **Site URL** and add the **Redirect URL** to your live Vercel domain, so
   magic links open the deployed app instead of localhost.

## 8. Add the family (~2 min)

Everyone signs in with their own email — magic link, no shared passwords, and
each person gets their own private profile and data:

- **You (Olivia)** → STRIDE Strength, Home + Gym, GLP-1 off.
- **Mum** → Foundations, light home DBs, **GLP-1 on** (protein reminders,
  bone-loading, no high-impact, RPE capped at 7).
- **Husband** → Maintain & Build (calisthenics-first), Home.

Each just opens the app, enters their email, and walks through onboarding once.

---

## Notes

- **Add to Home Screen** on iPhone (Share → Add to Home Screen) makes it feel
  like a native app — full screen, own icon.
- Progress photos are stored in a **private** bucket; each person can only ever
  see their own (enforced by the storage policy in the schema).
- Rep/weight history, PRs and progression suggestions are tracked against the
  **base** exercise, so swapping between home and gym versions of a lift keeps
  one continuous history.
- To reset onboarding for testing, delete your row from the `profiles` table in
  Supabase → Table Editor.
