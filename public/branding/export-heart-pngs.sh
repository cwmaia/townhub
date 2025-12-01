#!/bin/bash

# TownApp Heart Logo - PNG Export Script
# Generates PNG files at required sizes from SVG

# Requirements:
# - ImageMagick (brew install imagemagick)
# OR
# - Inkscape (brew install inkscape)

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SVG_FILE="$SCRIPT_DIR/townapp-icon-heart-static.svg"
OUTPUT_DIR="$SCRIPT_DIR/exports"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎨 TownApp Heart Logo - PNG Export"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ImageMagick is installed
if command -v magick &> /dev/null; then
    echo "✓ Using ImageMagick"
    EXPORT_TOOL="magick"
elif command -v convert &> /dev/null; then
    echo "✓ Using ImageMagick (legacy)"
    EXPORT_TOOL="convert"
elif command -v inkscape &> /dev/null; then
    echo "✓ Using Inkscape"
    EXPORT_TOOL="inkscape"
else
    echo "❌ Error: No SVG export tool found"
    echo ""
    echo "Please install one of:"
    echo "  - ImageMagick: brew install imagemagick"
    echo "  - Inkscape: brew install inkscape"
    exit 1
fi

echo ""
echo "📂 Source: $(basename $SVG_FILE)"
echo "📁 Output: $OUTPUT_DIR/"
echo ""

# Export function using ImageMagick
export_imagemagick() {
    local size=$1
    local output=$2
    echo "  → Exporting ${size}x${size}..."

    if [ "$EXPORT_TOOL" = "magick" ]; then
        magick -background none -density 300 "$SVG_FILE" \
               -resize ${size}x${size} \
               -strip \
               "$output"
    else
        convert -background none -density 300 "$SVG_FILE" \
                -resize ${size}x${size} \
                -strip \
                "$output"
    fi
}

# Export function using Inkscape
export_inkscape() {
    local size=$1
    local output=$2
    echo "  → Exporting ${size}x${size}..."

    inkscape "$SVG_FILE" \
             --export-type=png \
             --export-width=$size \
             --export-height=$size \
             --export-filename="$output"
}

# Export at required sizes
echo "Generating PNG exports..."
echo ""

if [ "$EXPORT_TOOL" = "inkscape" ]; then
    export_inkscape 256 "$OUTPUT_DIR/townapp-heart-256.png"
    export_inkscape 512 "$OUTPUT_DIR/townapp-heart-512.png"
    export_inkscape 1024 "$OUTPUT_DIR/townapp-heart-1024.png"
else
    export_imagemagick 256 "$OUTPUT_DIR/townapp-heart-256.png"
    export_imagemagick 512 "$OUTPUT_DIR/townapp-heart-512.png"
    export_imagemagick 1024 "$OUTPUT_DIR/townapp-heart-1024.png"
fi

echo ""
echo "✅ Export complete!"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR"/*.png

echo ""
echo "📦 Next steps:"
echo "  1. Copy PNGs to mobile project: cp exports/*.png ../../townhub-mobile/assets/"
echo "  2. Update mobile app configuration"
echo "  3. Test on iOS and Android devices"
echo ""
