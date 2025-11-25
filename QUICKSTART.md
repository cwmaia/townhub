# TownHub Quick Start Guide

## The Problem You Had
You were getting `EPERM: operation not permitted` errors when trying to run the Next.js backend because your environment doesn't allow binding to network ports directly.

## The Solution
Run the backend in a Docker container, which handles all the port binding for you.

---

## Prerequisites
- ✅ Docker Desktop installed and **running**
- ✅ `.env` file exists in `~/townhub` directory

---

## Start the Backend (3 Options)

### Option 1: Using the Script (Easiest)
```bash
cd ~/townhub
./start-dev.sh
```

### Option 2: Using Docker Compose Directly
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml up
```

### Option 3: Run in Background (Detached)
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml up -d

# View logs
docker-compose -f docker-compose.simple.yml logs -f
```

---

## Access Your Application

Once started, the backend will be available at:
**http://localhost:3000**

---

## Start the Mobile App

In a **new terminal window**:
```bash
cd ~/townhub-mobile
npm start
```

Then:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## Useful Commands

### Stop the Backend
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml down
```

### Restart the Backend
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml restart
```

### View Logs
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml logs -f
```

### Check if Container is Running
```bash
docker ps
```
You should see a container named `townhub-backend` with port `3000->3000`

---

## Troubleshooting

### "Port 3000 already in use"

Check what's using it:
```bash
lsof -i :3000
```

Kill the process:
```bash
kill -9 <PID>
```

Or use a different port by editing `docker-compose.simple.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

### "Docker command not found"

Make sure Docker Desktop is:
1. Installed ([Download here](https://www.docker.com/products/docker-desktop))
2. Running (check menu bar for Docker icon)

### Container Stops Immediately

Check logs for errors:
```bash
docker-compose -f docker-compose.simple.yml logs backend
```

Common issues:
- Missing `.env` file
- Invalid `DATABASE_URL` in `.env`
- npm install errors (try: `docker-compose -f docker-compose.simple.yml down` then restart)

### Need to Reset Everything
```bash
cd ~/townhub
docker-compose -f docker-compose.simple.yml down
docker system prune -f
docker-compose -f docker-compose.simple.yml up
```

---

## What's Different from Before?

**Before:**
```bash
npm run dev  # ❌ EPERM error - can't bind to port
```

**Now:**
```bash
docker-compose -f docker-compose.simple.yml up  # ✅ Works!
```

The Docker container has permission to bind to ports, solving your EPERM issue.

---

## Development Workflow

1. **Start Backend:**
   ```bash
   cd ~/townhub
   ./start-dev.sh
   ```

2. **Start Mobile App (new terminal):**
   ```bash
   cd ~/townhub-mobile
   npm start
   ```

3. **Make changes** - Both auto-reload:
   - Backend: Hot-reloads when you edit files
   - Mobile: Fast Refresh in Expo

4. **Stop when done:**
   ```bash
   docker-compose -f docker-compose.simple.yml down
   ```

---

## Configuration

Your app uses:
- **Database:** Supabase (configured in `.env`)
- **Backend:** Next.js on port 3000
- **Mobile:** Expo connecting to http://localhost:3000

Everything is already configured in your `.env` file - no changes needed!
