# TownHub Setup Guide for AI Assistants

This guide is designed for AI assistants setting up the TownHub project on a new machine.

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Database created
- [ ] Environment variables configured
- [ ] Database schema pushed
- [ ] Database seeded
- [ ] Development server running

## Platform-Specific Prerequisites

### Windows
```cmd
# Verify installations
node --version
npm --version
git --version
pg_config --version

# Check PostgreSQL service
sc query postgresql-x64-16
```

### macOS
```bash
# Verify installations
node --version
npm --version
git --version
psql --version

# Check PostgreSQL service
brew services list | grep postgresql
```

## Step-by-Step Setup

### 1. Clone Repository
```bash
git clone https://github.com/cwmaia/townhub.git
cd townhub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create PostgreSQL Database

**Windows (PowerShell or Command Prompt):**
```cmd
psql -U postgres -c "CREATE DATABASE townhub;"
```

**macOS:**
```bash
createdb townhub
```

Verify:
```bash
psql -U postgres -l
```

### 4. Configure Environment Variables

**Windows:**
```cmd
copy .env.example .env.local
```

**macOS:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with these required values:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/townhub"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
ADMIN_EMAILS="your-email@example.com"
TOWN_ADMIN_EMAILS="stykkish-town-admin@example.com"
```

### 5. Push Database Schema
```bash
npm run db:push
```

This command:
- Generates Prisma Client
- Creates all database tables
- Applies schema to PostgreSQL

### 6. Seed Database
```bash
npm run db:seed
```

This populates:
- Places (services, lodging, restaurants, attractions)
- Events
- Admin user profiles

### 7. Start Development Server
```bash
npm run dev
```

Access at: http://localhost:3000/en or http://localhost:3000/is

## Verification Steps

After setup, verify everything works:

1. **Database Connection:**
   ```bash
   npx prisma studio
   ```
   Should open Prisma Studio at http://localhost:5555

2. **Server Response:**
   Visit http://localhost:3000/en - should see TownHub homepage

3. **Admin Access:**
   - Visit http://localhost:3000/en/auth
   - Sign in with super admin (`ADMIN_EMAILS`) or town admin (`TOWN_ADMIN_EMAILS`) email
   - Check magic link in email
   - Visit http://localhost:3000/en/admin

## Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:push         # Push schema changes
npm run db:seed         # Seed database
npx prisma studio       # Open Prisma Studio
npx prisma generate     # Regenerate Prisma Client

# Image Fetching (Optional)
npx tsx database/seed/update_images.ts --town=stykkisholmur
```

## Troubleshooting Quick Fixes

### Database Connection Failed
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-16

# macOS:
brew services start postgresql@16
```

### Prisma Client Issues
```bash
npx prisma generate
npm run db:push
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Clean Install
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json  # macOS/Linux
npm install

# Windows (PowerShell):
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Project Structure Overview

```
townhub/
├── app/                    # Next.js App Router
│   └── [locale]/          # Internationalized routes
├── components/            # React components
├── database/
│   ├── schema.prisma      # Database schema
│   └── seed/              # Seed scripts
├── lib/                   # Utility functions
├── messages/              # i18n translations
├── public/                # Static assets
└── .env.local            # Environment variables (create from .env.example)
```

## Environment Variables Explained

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (used for server-side uploads)
- `SUPABASE_STORAGE_BUCKET` - Supabase Storage bucket for media assets
- `ADMIN_EMAILS` - Comma-separated admin emails
- `TOWN_ADMIN_EMAILS` - Comma-separated emails for town-scoped admins

### Optional (for enhanced features)
- `GOOGLE_MAPS_API_KEY` - For map display
- `GOOGLE_DISTANCE_MATRIX_API_KEY` - For travel distances
- `UNSPLASH_ACCESS_KEY` - For image fetching
- `PEXELS_API_KEY` - For image fetching
- `GOOGLE_CUSTOM_SEARCH_API_KEY` - For image fetching
- `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` - For image fetching

## Success Indicators

Setup is complete when:
- ✓ `npm run dev` starts without errors
- ✓ http://localhost:3000/en loads the homepage
- ✓ Database contains seeded places and events
- ✓ Admin authentication works
- ✓ No console errors in terminal or browser

## Next Steps After Setup

1. Review the main README.md for detailed feature documentation
2. Explore the codebase structure
3. Test admin functionality at /en/admin
4. Customize for different towns by modifying seed data
5. Configure additional API keys for enhanced features
