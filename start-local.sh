#!/bin/bash

# TownHub Local Development (without Docker)
# This runs the Next.js backend directly on your machine

set -e

echo "🚀 Starting TownHub Backend Locally..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your actual configuration values."
        echo ""
    else
        echo "❌ .env.example not found. Please create a .env file manually."
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --schema=database/schema.prisma

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy --schema=database/schema.prisma || echo "⚠️ Migrations failed - make sure PostgreSQL is running on localhost:5432"

# Start the development server
echo ""
echo "✅ Starting Next.js development server..."
echo "📍 Backend will be available at: http://localhost:3000"
echo ""

npm run dev
