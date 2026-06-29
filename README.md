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

## Migration status

**Done (this phase):** foundation, design system, Firebase wiring, shared components,
and the public/static pages (Home, About, Contact, Newsletter, Terms, Privacy,
Cancellation/Refund).

**Next phases (not yet ported):**

- Auth (Firebase Auth) + user/customer context
- Booking flow: location → ticket type → quantity → date → slot → payment → confirmation
- Razorpay payment integration (server-side via Route Handlers / Server Actions)
- Admin: dashboard, ticket verification, slot generator, attendance, super-admin
- Firestore data model + Security Rules to replace the FastAPI routes
  (customers, tickets, slots, payments, OTP, events, field-visit, etc.)
