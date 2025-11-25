#!/bin/bash

# TownHub Diagnostic Script
# Run this to check the status of your Docker services

echo "====== Docker Container Status ======"
docker ps -a | grep townhub

echo ""
echo "====== Backend Container Logs (last 50 lines) ======"
docker-compose -f docker-compose.dev.yml logs --tail=50 backend

echo ""
echo "====== Database Container Logs (last 20 lines) ======"
docker-compose -f docker-compose.dev.yml logs --tail=20 postgres

echo ""
echo "====== Port Usage Check ======"
echo "Checking if port 3000 is in use:"
lsof -i :3000 || echo "Port 3000 is not in use"

echo ""
echo "Checking if port 5432 is in use:"
lsof -i :5432 || echo "Port 5432 is not in use"

echo ""
echo "====== Docker Compose Services Status ======"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "====== Checking .env file ======"
if [ -f .env ]; then
    echo ".env file exists ✓"
    echo "Key variables present:"
    grep -E "^(SUPABASE_URL|DATABASE_URL|NEXT_PUBLIC_APP_URL)=" .env || echo "Some required variables might be missing"
else
    echo "❌ .env file NOT found!"
fi
