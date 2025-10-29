const handler = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const width = Number(searchParams.get("width") ?? 600);
  const height = Number(searchParams.get("height") ?? 300);
  const lat = Number(searchParams.get("lat") ?? 0);
  const lng = Number(searchParams.get("lng") ?? 0);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#dbeafe" />
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="#eff6ff" stroke="#93c5fd" stroke-width="4" />
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="18" fill="#1e3a8a">
        Stykkishólmur
      </text>
      <text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="14" fill="#3b82f6">
        Lat ${lat.toFixed(3)}, Lng ${lng.toFixed(3)}
      </text>
      <circle cx="50%" cy="50%" r="14" fill="#f97316" stroke="#1e293b" stroke-width="2" />
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
