#!/bin/bash

echo "🧹 Cleaning caches..."
rm -rf .next
rm -rf node_modules/.prisma

echo "🔧 Regenerating Prisma client..."
npx prisma generate --schema=database/schema.prisma

echo "✅ Done! Now starting server..."
npm run dev
