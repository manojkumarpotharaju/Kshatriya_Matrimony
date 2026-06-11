# 🛡️ Kshatriya Matrimony

A React (Vite) matrimony website for the Kshatriya community with matches, subscription-gated
chat & calls, card/UPI/cash payments, and a full admin dashboard.

## Features

**Members**
- Browse verified profiles with photos, gotra, sub-caste, education, income & family details
- Search and filter by name, sub-caste, gender, and city
- Send interests for free; full details unlock after sign-in
- 💬 Chat — Silver plan and above
- 📞 Voice/video call (simulated) — Gold plan and above
- Plans: Silver ₹999 / Gold ₹2,499 / Platinum ₹4,999
- Pay by **Card**, **UPI** (QR + UPI ID), or **Cash at office** (admin approval flow)
- Active offers auto-apply a discount at checkout

**Admin** (login: `admin@kshatriya.com` / `admin123`)
- Dashboard stats: profiles, users, paid members, revenue, pending cash, live offers
- Add / remove member profiles (auto photo if no URL given)
- Launch day-to-day **offers** (title, % discount, promo code, expiry) — shown in the site banner
- Approve pending **cash payments** to activate plans
- View all payments with method, offer applied, and status

All data persists in the browser via `localStorage` (no backend needed for the demo).

## Run locally in VS Code

```bash
# 1. Open this folder in VS Code, then in the terminal:
npm install
npm run dev
# open http://localhost:5173
```

Requires Node.js 18+ (https://nodejs.org).

## Deploy for free

### Option A — Vercel (recommended)
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → "Add New Project" → import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. Click **Deploy** — you get a live `*.vercel.app` URL in ~1 minute.

CLI alternative: `npm i -g vercel && vercel` from the project folder.

### Option B — Netlify
1. Push to GitHub → https://app.netlify.com → "Import from Git".
2. Build command: `npm run build` · Publish directory: `dist`.
3. Deploy. Or drag-and-drop the `dist/` folder (after `npm run build`) onto Netlify Drop.

### Option C — Render
Static Site → connect repo → Build: `npm run build` → Publish dir: `dist`.

## Going to production (next steps)

- Replace localStorage with a backend (Node/Express + PostgreSQL, or Firebase/Supabase)
- Integrate **Razorpay** (best for India — supports cards + UPI natively) or Stripe
- Real chat/calls: Socket.io for chat, **LiveKit**/Agora/Twilio for voice & video
- Auth: Firebase Auth or JWT with hashed passwords (never store plain passwords)
- Image uploads: Cloudinary or S3 instead of photo URLs
- Replace placeholder photos (randomuser.me / Unsplash) with real member photos & consent
