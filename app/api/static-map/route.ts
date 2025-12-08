const handler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const width = Number(searchParams.get("width") ?? 600);
  const height = Number(searchParams.get("height") ?? 300);
  const lat = Number(searchParams.get("lat") ?? 0);
  const lng = Number(searchParams.get("lng") ?? 0);

  // Create a more attractive map-like placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E0F4FF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.6" />
        </linearGradient>
      </defs>

      <!-- Background gradient -->
      <rect width="100%" height="100%" fill="url(#skyGradient)" />

      <!-- Decorative water elements (representing Iceland's coast) -->
      <ellipse cx="${width * 0.3}" cy="${height * 0.7}" rx="${width * 0.4}" ry="${height * 0.3}" fill="url(#waterGradient)" opacity="0.4" />
      <ellipse cx="${width * 0.7}" cy="${height * 0.8}" rx="${width * 0.35}" ry="${height * 0.25}" fill="url(#waterGradient)" opacity="0.3" />

      <!-- Land mass shape -->
      <path d="M${width * 0.2},${height * 0.3} Q${width * 0.4},${height * 0.15} ${width * 0.6},${height * 0.25} Q${width * 0.8},${height * 0.35} ${width * 0.75},${height * 0.55} Q${width * 0.6},${height * 0.65} ${width * 0.35},${height * 0.6} Q${width * 0.15},${height * 0.5} ${width * 0.2},${height * 0.3}"
            fill="#a3e635" opacity="0.5" />

      <!-- Center point marker -->
      <circle cx="${width / 2}" cy="${height / 2}" r="20" fill="#003580" stroke="#ffffff" stroke-width="4" />
      <circle cx="${width / 2}" cy="${height / 2}" r="8" fill="#ffffff" />

      <!-- Town name -->
      <text x="${width / 2}" y="${height / 2 + 50}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#1e3a8a">
        Stykkishólmur
      </text>

      <!-- Coordinates -->
      <text x="${width / 2}" y="${height / 2 + 72}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b">
        ${lat.toFixed(3)}°N, ${Math.abs(lng).toFixed(3)}°W
      </text>

      <!-- Click to explore hint -->
      <rect x="${width / 2 - 70}" y="${height - 45}" width="140" height="30" rx="15" fill="#003580" opacity="0.9" />
      <text x="${width / 2}" y="${height - 25}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#ffffff">
        🗺️ Click to explore
      </text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};

export { handler as GET };
