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

### Required Software

- **Node.js 18+** (20 or 22 LTS recommended)
- **npm** (comes with Node.js)
- **Git** for version control
- **PostgreSQL 14+** database
- **Supabase project** (URL + anon/public key)

### Optional but Recommended

- **Google Maps API keys** (Static Maps + Distance Matrix)
- **Image API keys** (Google Custom Search, Unsplash, Pexels)

---

## Installation Guide

### macOS Setup

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node@20
   ```

3. **Install PostgreSQL**:
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

4. **Clone the repository**:
   ```bash
   git clone https://github.com/cwmaia/townhub.git
   cd townhub
   ```

### Windows Setup

1. **Install Node.js**:
   - Download the LTS installer from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the prompts
   - Verify installation:
     ```cmd
     node --version
     npm --version
     ```

2. **Install PostgreSQL**:
   - Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - Run the installer (remember your postgres user password)
   - Default port is 5432
   - Ensure PostgreSQL service is running (check Services app)

3. **Install Git**:
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Use default settings during installation

4. **Clone the repository**:
   ```cmd
   git clone https://github.com/cwmaia/townhub.git
   cd townhub
   ```

---

## Project Setup

Follow these steps on both macOS and Windows:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Create a new database for the project:

**macOS/Linux:**
```bash
createdb townhub
```

**Windows (using psql):**
```cmd
psql -U postgres
CREATE DATABASE townhub;
\q
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

**macOS/Linux:**
```bash
cp .env.example .env.local
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Required
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/townhub"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
SUPABASE_STORAGE_BUCKET="townapp-media"
ADMIN_EMAILS="your-email@example.com"
TOWN_ADMIN_EMAILS="stykkish-town-admin@example.com"

# Optional but recommended
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_MAPS_API_KEY="your-google-maps-key"
GOOGLE_DISTANCE_MATRIX_API_KEY="your-distance-matrix-key"
UNSPLASH_ACCESS_KEY="your-unsplash-key"
PEXELS_API_KEY="your-pexels-key"
GOOGLE_CUSTOM_SEARCH_API_KEY="your-custom-search-key"
GOOGLE_CUSTOM_SEARCH_ENGINE_ID="your-search-engine-id"
```

### 4. Generate Prisma Client and Push Schema

```bash
npm run db:push
```

This creates the database tables based on the Prisma schema.

### 5. Seed the Database

```bash
npm run db:seed
```

The seed script creates initial data for Stykkishólmur places and events.

### 6. (Optional) Fetch Curated Images

```bash
npx tsx database/seed/update_images.ts --town=stykkisholmur
```

Options:
- `--auto` - Non-interactive mode
- `--type=events` or `--type=places` - Filter by type
- `--limit=1` - Limit number of items
- `--dry-run` - Preview without saving

### 7. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Locale-prefixed routes are available:
- English: [http://localhost:3000/en](http://localhost:3000/en)
- Icelandic: [http://localhost:3000/is](http://localhost:3000/is)

## Admin Access

Emails listed in `ADMIN_EMAILS` become **super admins** with full access. Emails in `TOWN_ADMIN_EMAILS` become **town admins** scoped to Stykkishólmur (or their assigned town). Admins can manage places and events from `/en/admin` (or `/is/admin`). Authentication uses Supabase magic links.

## Scripts

- `npm run lint` — Run ESLint
- `npm run db:push` — Push Prisma schema to the database
- `npm run db:seed` — Seed Stykkishólmur places and events
- `npx tsx database/seed/update_images.ts` — Interactive image curation for places/events

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify PostgreSQL is running:
  - **macOS:** `brew services list | grep postgresql`
  - **Windows:** Check Services app or run `pg_isready`
- Check DATABASE_URL format: `postgresql://username:password@localhost:5432/townhub`
- Ensure the database exists: `psql -U postgres -l` (should list townhub)

**Port Already in Use:**
- Next.js default port 3000 might be occupied
- Use: `npm run dev -- -p 3001` to run on a different port

**Prisma Client Errors:**
- Run `npx prisma generate` to regenerate the client
- If schema changes, run `npm run db:push` again

**Module Not Found Errors:**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- On Windows use: `rmdir /s node_modules` and `del package-lock.json`

**Image Fetcher Issues:**
- Requires valid API keys in `.env.local`
- Can skip this step if you don't need custom images
- Placeholder images will be used automatically

**Windows Path Issues:**
- If you encounter path-related errors, ensure you're using a terminal with admin privileges
- Consider using Git Bash instead of Command Prompt for better compatibility

### Getting Help from Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. No additional Supabase configuration needed - authentication is handled automatically

## Deployment Notes

- Ensure Supabase and database environment variables are provided at build and runtime.
- Configure Google Maps APIs for richer map and travel-time data; fallbacks use internal Haversine calculations if keys are missing.
- Provide Google Custom Search, Unsplash, and Pexels API keys so the image-fetcher can run in production pipelines if desired.
- For production deployment (Vercel, Netlify, etc.), set all environment variables in your hosting platform's dashboard
- Database should be hosted (consider Supabase Database, Railway, or Render for PostgreSQL hosting)
