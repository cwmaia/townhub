## TownHub · Stykkishólmur One-Pager

TownHub is a booking-style single-page experience for Stykkishólmur, Iceland. It highlights services, lodging, restaurants, attractions, live events, weather, maps, and travel distances with Supabase authentication and a Prisma/PostgreSQL backend.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui components
- Prisma ORM with PostgreSQL
- Supabase Auth (email magic link)
- next-intl for i18n (English + Icelandic)
- Google Maps Static API & Distance Matrix (with fallback)
- Open-Meteo weather API

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project (URL + anon/public key)
- Google Maps API keys (Static Maps + Distance Matrix) — optional but recommended

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values for Supabase, database URL, and any Google API keys. Add comma-separated admin emails to `ADMIN_EMAILS` to grant access to `/admin`.

3. **Generate Prisma schema and database tables**

   ```bash
   npm run db:push
   ```

4. **Seed Stykkishólmur data**

   ```bash
   npm run db:seed
   ```

   The seed script fetches coordinates via Nominatim and downloads square Unsplash images to `public/media/`.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000). Locale-prefixed routes are generated automatically (`/en`, `/is`).

## Admin Access

Users whose email addresses match `ADMIN_EMAILS` will be promoted to admin on seed or first login. Admins can manage places and events from `/en/admin` (or `/is/admin`). Authentication uses Supabase magic links.

## Scripts

- `npm run lint` — Run ESLint
- `npm run db:push` — Push Prisma schema to the database
- `npm run db:seed` — Seed Stykkishólmur places and events

## Deployment Notes

- Ensure Supabase and database environment variables are provided at build and runtime.
- Configure Google Maps APIs for richer map and travel-time data; fallbacks use internal Haversine calculations if keys are missing.
