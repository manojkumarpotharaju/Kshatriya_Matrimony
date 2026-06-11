# 🗄️ Supabase Setup — 15 minutes, free, no credit card

Follow these steps in order. After this, every visitor shares ONE real database:
signups, profiles, payments and offers are visible to you (admin) from anywhere.

## 1. Create the project
1. Go to https://supabase.com → Sign up (GitHub login works) → **New project**
2. Name: `kshatriya-matrimony` · Region: **Mumbai (ap-south-1)** · Set a strong DB password
3. Wait ~2 minutes for provisioning

## 2. Create the tables
1. In the dashboard, open **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql` → **Run** (should say "Success")
3. Optional: new query → paste `supabase/seed.sql` → Run (adds 12 demo profiles + a launch offer so the site isn't empty)

## 3. Turn OFF email confirmation (recommended to start)
By default Supabase makes new users confirm via email before they can sign in.
1. **Authentication → Sign In / Providers → Email**
2. Toggle **"Confirm email" OFF** → Save
(You can switch it back on later once you configure a custom SMTP sender.)

## 4. Get your API keys
1. **Project Settings → API**
2. Copy **Project URL** and the **anon / public** key

## 5. Configure the app
Create a file `.env.local` in the project root (next to package.json):
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```
Run `npm install` (adds the supabase client), then `npm run dev` and test signup.

> The anon key is safe to expose in the browser — Row Level Security (set up by
> schema.sql) is what protects the data, not key secrecy.

## 6. Make YOURSELF the admin
1. Register normally on the website with your own email
2. Supabase → **SQL Editor** → run:
```sql
update public.members set is_admin = true where email = 'your-email@gmail.com';
```
3. Log out and log back in on the site → the **Admin** tab appears

## 7. Deploy on Vercel
1. Push the code to GitHub (`.env.local` is git-ignored — good, never commit it)
2. Vercel → your project → **Settings → Environment Variables** → add BOTH:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deployments → Redeploy** (env vars only apply on a fresh build)

## How the verify & money flow works now
- Member signs up (stored in Supabase Auth, password properly hashed)
- Member creates profiles (self / son / daughter / …) → saved as **Pending**
- Only YOU see pending profiles → Admin → Profiles → **Verify** → goes live for everyone
- Member pays (card/UPI simulated, cash = pending) → row in `payments` table
- Cash: Admin → Payments → **Approve cash** → plan activates for that member
- Revenue total shows on the Overview tab

## Free tier limits (plenty to start)
- 500 MB database, 50,000 monthly active users, 5 GB bandwidth
- Project pauses after 7 days of inactivity on free tier — just hit "Restore" in
  the dashboard, data is kept. Upgrade to Pro ($25/mo) when you have real traffic.

## When real money starts (next milestone)
Card/UPI payments are still simulated. Before charging customers, integrate
**Razorpay** (Indian cards + UPI natively): it needs one tiny server endpoint to
create orders — a Vercel serverless function works, no separate server needed.
Ask me when you're ready and I'll wire it.
