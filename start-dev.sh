#!/bin/bash

# TownHub Development Startup Script
# This script starts the backend services using Docker Compose

set -e

echo "🚀 Starting TownHub Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

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

# Start Docker Compose
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.simple.yml up

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Backend running at: http://localhost:3000"
echo "📍 Database running at: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs:        docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services:    docker-compose -f docker-compose.dev.yml down"
echo "   Restart backend:  docker-compose -f docker-compose.dev.yml restart backend"
echo ""
echo "📱 To start the mobile app, run in a new terminal:"
echo "   cd ~/townhub-mobile && npm start"
echo ""
echo "🔍 To view logs now, run:"
docker-compose -f docker-compose.dev.yml logs -f
