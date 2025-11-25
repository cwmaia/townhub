#!/bin/bash

echo "🔍 Looking for Docker..."

# Check common Docker Desktop locations
DOCKER_LOCATIONS=(
    "/Applications/Docker.app/Contents/Resources/bin"
    "$HOME/.docker/bin"
    "/usr/local/bin"
)

DOCKER_PATH=""

for location in "${DOCKER_LOCATIONS[@]}"; do
    if [ -f "$location/docker" ]; then
        DOCKER_PATH="$location"
        echo "✅ Found Docker at: $DOCKER_PATH"
        break
    fi
done

if [ -z "$DOCKER_PATH" ]; then
    echo "❌ Docker binary not found. Please try:"
    echo "   1. Quit Docker Desktop"
    echo "   2. Reopen Docker Desktop"
    echo "   3. Wait for it to fully start"
    echo "   4. Run this script again"
    exit 1
fi

# Add to current shell
echo ""
echo "Adding Docker to PATH for this session..."
export PATH="$DOCKER_PATH:$PATH"

# Test it
if command -v docker &> /dev/null; then
    echo "✅ Docker command is now available!"
    docker --version
    echo ""
    echo "🚀 You can now run: ./start-dev.sh"
    echo ""
    echo "⚠️  To make this permanent, add this to your ~/.zshrc:"
    echo "   export PATH=\"$DOCKER_PATH:\$PATH\""
else
    echo "❌ Still can't find docker command"
fi
