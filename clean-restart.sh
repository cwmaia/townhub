#!/bin/bash

echo "🛑 Stopping any running processes..."
pkill -f "next dev" || true

echo "🧹 Cleaning all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.prisma

echo "🔧 Regenerating Prisma client..."
npx prisma generate --schema=database/schema.prisma

echo ""
echo "✅ Clean restart complete!"
echo ""
echo "🧪 Testing database connection..."
npx prisma db execute --schema=database/schema.prisma --stdin <<< "SELECT 1;" && echo "✅ Database connection works!" || echo "❌ Database connection failed - check your password!"

echo ""
echo "Starting server..."
npm run dev
