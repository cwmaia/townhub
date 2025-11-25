# TownHub Docker Setup Guide

This guide will help you run the TownHub application using Docker, which solves port permission issues and simplifies the setup process.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### Option 1: Development Mode (Recommended for Development)

Development mode provides hot-reloading and easier debugging:

```bash
# Navigate to the townhub directory
cd ~/townhub

# Start the services
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the services
docker-compose -f docker-compose.dev.yml down
```

The backend will be available at: http://localhost:3000

### Option 2: Production Mode

Production mode builds an optimized version of the application:

```bash
# Navigate to the townhub directory
cd ~/townhub

# Build and start the services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the services
docker-compose down
```

## Configuration

### Environment Variables

The application uses environment variables from your `.env` file. Make sure you have a `.env` file in the `~/townhub` directory with your configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your actual values
nano .env  # or use your preferred editor
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

Optional variables:
- `GOOGLE_MAPS_API_KEY` - For Google Maps integration
- `UNSPLASH_ACCESS_KEY` - For Unsplash images
- `PEXELS_API_KEY` - For Pexels images

## Database

The PostgreSQL database is automatically created and configured through Docker Compose. It includes:

- Database name: `townhub`
- Username: `postgres`
- Password: `postgres`
- Port: `5432` (accessible on your local machine)

### Running Database Migrations

Migrations run automatically when you start the services. To run them manually:

```bash
# Development mode
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy --schema=database/schema.prisma

# Production mode
docker-compose exec backend npx prisma migrate deploy --schema=/app/database/schema.prisma
```

### Database Seeding

To seed the database with initial data:

```bash
# Development mode
docker-compose -f docker-compose.dev.yml exec backend npm run db:seed

# Production mode
docker-compose exec backend npm run db:seed
```

## Running the Mobile App

Once the backend is running via Docker, you can run the mobile app:

```bash
# Navigate to the mobile app directory
cd ~/townhub-mobile

# Install dependencies (if not already done)
npm install

# Start the Expo development server
npm start

# Or start for specific platform
npm run android  # For Android
npm run ios      # For iOS (requires Mac)
```

The mobile app is configured to connect to `http://localhost:3000` which is where the Docker backend runs.

## Useful Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers, volumes (⚠️ deletes database data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d townhub

# Or use a GUI tool like pgAdmin or DBeaver with:
# Host: localhost
# Port: 5432
# Database: townhub
# Username: postgres
# Password: postgres
```

## Troubleshooting

### Port Already in Use

If you get an error that port 3000 or 5432 is already in use:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Kill the process (replace PID with the actual process ID)
kill -9 PID
```

Or modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Container Won't Start

Check the logs:
```bash
docker-compose logs backend
```

Common issues:
- Missing environment variables in `.env`
- Database connection issues (wait for database to be healthy)
- Build errors (try rebuilding: `docker-compose up --build`)

### Database Connection Issues

Ensure the database container is healthy:
```bash
docker-compose ps
```

You should see `healthy` status for the postgres service.

### Reset Everything

If you need to start fresh:
```bash
# Stop all containers
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild and start
docker-compose up --build
```

## Development Workflow

1. Start the backend with Docker (development mode):
   ```bash
   cd ~/townhub
   docker-compose -f docker-compose.dev.yml up
   ```

2. In a new terminal, start the mobile app:
   ```bash
   cd ~/townhub-mobile
   npm start
   ```

3. Make changes to your code - the backend will hot-reload automatically in development mode

4. Access the backend at http://localhost:3000
5. Use Expo Go or simulator to test the mobile app

## Additional Notes

- The development Docker setup mounts your local code as a volume, so changes are reflected immediately
- The production Docker setup creates an optimized build suitable for deployment
- Database data persists in Docker volumes, so stopping containers won't lose your data
- Use `docker-compose down -v` only if you want to completely reset the database
