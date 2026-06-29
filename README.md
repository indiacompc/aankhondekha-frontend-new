# Aankhon Dekha — Next.js rebuild

A rebuild of the Aankhon Dekha VR Experience Centre site on a modern stack:

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** (Auth + Firestore + Storage) as the backend — replacing the old FastAPI service
- Deploys to **Vercel**

> This lives alongside the original apps (`aankhon-dekha-frontend`, `aankhon-dekha-backend`)
> and does **not** modify them. It is a clean, parallel rebuild.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase values
npm run dev                  # http://localhost:3000
```

### Environment variables

See [`.env.example`](./.env.example). Create a Firebase project at
<https://console.firebase.google.com>, enable **Authentication** and **Firestore**,
and copy the web app config into `.env.local`. The `NEXT_PUBLIC_*` keys are exposed
to the browser by design — secure data with Firebase Auth + Firestore Security Rules.

## Static assets

The original `public/` folder is **git-ignored** in the old repo, so images/videos/logos
are not in source control. Drop them into [`public/`](./public) using the **same paths**
the components expect — see [`public/README.md`](./public/README.md) for the full list.
Until then, image areas render empty but layouts are intact.

## Project structure

```
src/
  app/
    layout.tsx              Root layout: metadata, fonts, GA, JSON-LD, toaster
    globals.css             Tailwind v4 theme + design tokens (ported)
    page.tsx + HomeClient   Home page
    about/                  About
    contact/                Contact
    newsletter/             Newsletter archive
    terms-condition/        Terms & Conditions
    privacy-policy/         Privacy Policy
    cancellation-refund/    Cancellation & Refund
  components/               Navbar, Footer, BackButton, AttractionsSection, Testimonial
  lib/
    firebase.ts             Firebase client init (auth, db, storage)
    seo.ts                  pageMetadata() helper (replaces old <SEO/>)
    utils.ts                cn() class merge helper
```

## Deploy to Vercel

1. Push this folder to a Git repo (or run `vercel` from here).
2. Import the project in Vercel — it auto-detects Next.js (no extra config needed).
3. Add the same env vars from `.env.local` in **Project Settings → Environment Variables**.
4. Deploy. Vercel runs `next build` and serves it.

## Firestore setup & seeding

1. In the Firebase Console enable **Authentication → Phone & Email/Password**, create the **Firestore** database, and (optional) **Storage**.
2. Put your service-account key (`*firebase-adminsdk*.json`) in the project root — it's git-ignored.
3. Seed reference data + a Super Admin:
   ```bash
   npm run seed          # 14 days of slots; pass a number for more, e.g. `node scripts/seed.mjs 30`
   ```
   This creates events, sample ticket types, slots, and a Super Admin
   (`admin@aankhondekha.com` / `Admin@12345` — change the password after first login).
   Override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars.
4. Publish security rules from [`firestore.rules`](./firestore.rules):
   Firebase Console → Firestore → Rules → paste → Publish.

## Booking flow

`/location → /register (if new) → /ticket-type → /quantity → /date-selection →
/slot-selection → /payment (mock) → /confirmation (QR)`

- Capacity is decremented atomically in a Firestore transaction (no overbooking).
- GST is 18% inclusive; complimentary tickets = floor(qty/4); tour guide for Bhopal qty ≥ 10.
- **Payment is mocked** — the booking is marked paid without a real charge. Razorpay can be added later (keys already scaffolded in `.env.example`).

## Admin

- `/admin` — email/password login (Firebase Auth). Role comes from the `admins/{uid}` Firestore doc.
- Role homes: Super Admin → `/super-admin`, Ops Admin → `/admin-ops`, Reception → `/admin-dashboard`.
- `/ticket-verification` — look up a ticket by ID and check it in (sets `isValid=false`).
- Add more admins by creating an Auth user + an `admins/{uid}` doc (extend the seed script).

## Migration status

**Done (this phase):** foundation, design system, Firebase wiring, shared components,
and the public/static pages (Home, About, Contact, Newsletter, Terms, Privacy,
Cancellation/Refund).

**Done:** Phone-OTP registration, Firestore data model + rules + seed, full booking
flow (mock payment) with QR confirmation, admin login + roles + ticket verification.

**Next phases (not yet ported):**

- Real Razorpay payment (server-side verify via Route Handler) instead of mock
- Gift tickets, referral codes
- Admin dashboards/analytics, reports export, slot-generator UI, attendance
- WhatsApp/SMS confirmations
- QR-scan camera input on the verification screen (currently manual ID entry)
