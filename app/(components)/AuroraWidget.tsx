'use client';

type AuroraWidgetProps = {
  auroraData: {
    kpIndex: number;
    probability: number;
    description: string;
  } | null;
};

const getAuroraLevel = (kp: number): { label: string; color: string; bgColor: string } => {
  if (kp >= 7) return { label: "High", color: "text-green-700", bgColor: "bg-green-500/10" };
  if (kp >= 5) return { label: "Moderate", color: "text-yellow-700", bgColor: "bg-yellow-500/10" };
  if (kp >= 3) return { label: "Low", color: "text-orange-700", bgColor: "bg-orange-500/10" };
  return { label: "Very Low", color: "text-slate-700", bgColor: "bg-slate-500/10" };
};

const AuroraWidget = ({ auroraData }: AuroraWidgetProps) => {
  // Vedur.is cloud cover forecast image for Iceland (low and mid-level clouds)
  // Green = cloudy, White = clear skies
  // Images are updated at 00, 06, 12, 18 UTC - use the most recent run
  const now = new Date();
  const utcHour = now.getUTCHours();

  // Determine the most recent model run (00, 06, 12, or 18 UTC)
  // Model runs take ~2 hours to be available, so we use the previous run
  let runHour: string;
  if (utcHour >= 20) runHour = '1800';
  else if (utcHour >= 14) runHour = '1200';
  else if (utcHour >= 8) runHour = '0600';
  else if (utcHour >= 2) runHour = '0000';
  else runHour = '1800'; // Use previous day's 18:00 run

  // If using previous day's run, adjust date
  const dateToUse = new Date(now);
  if (utcHour < 2) {
    dateToUse.setUTCDate(dateToUse.getUTCDate() - 1);
  }

  const dateStr = `${dateToUse.getUTCFullYear().toString().slice(2)}${String(dateToUse.getUTCMonth() + 1).padStart(2, '0')}${String(dateToUse.getUTCDate()).padStart(2, '0')}`;

  // Add cache buster that changes every 30 minutes to ensure fresh data
  const cacheBuster = Math.floor(now.getTime() / (30 * 60 * 1000));

  const cloudCoverUrl = `https://en.vedur.is/photos/isl_skyjahula2/${dateStr}_${runHour}_1.png?_=${cacheBuster}`;

  // Alternative: Total cloud cover composite
  const cloudCoverAltUrl = `https://en.vedur.is/photos/harmonie_island_tcc_lcc_mcc_hcc/${dateStr}_${runHour}_1.png?_=${cacheBuster}`;

  // Fallback static map showing Iceland
  const fallbackMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=64.9,-18.5&zoom=5&size=400x250&scale=2&maptype=terrain&style=feature:all|saturation:-50&markers=color:green|label:S|65.075,-22.73&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyA3MSCsqQr282qPM52kjTCiHp8VQT91XNQ'}`;

  if (!auroraData) {
    return (
      <div className="flex flex-col rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 h-full min-h-[280px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🌌</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Aurora Forecast
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-emerald-600">Loading aurora data...</p>
        </div>
      </div>
    );
  }

  const level = getAuroraLevel(auroraData.kpIndex);

  return (
    <div className={`flex flex-col rounded-2xl border border-emerald-200 ${level.bgColor} p-4 h-full min-h-[280px]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌌</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Aurora Forecast
          </span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white`}>
          {level.label}
        </span>
      </div>

      {/* KP Index + Visibility */}
      <div className="flex items-center gap-4 mb-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${level.color}`}>
              {auroraData.kpIndex.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">/9 KP</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">Visibility</span>
            <span className="text-xs font-bold text-slate-700">{auroraData.probability}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
              style={{ width: `${auroraData.probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 mb-2">{auroraData.description}</p>

      {/* Info badges */}
      <div className="flex gap-2 mb-2">
        <div className="rounded-lg bg-emerald-100 px-2 py-1">
          <span className="text-[10px] text-emerald-700">🌙 Peak: 22:00-02:00</span>
        </div>
        <div className="rounded-lg bg-emerald-100 px-2 py-1">
          <span className="text-[10px] text-emerald-700">📍 Best: North shore</span>
        </div>
      </div>

      {/* Cloud Cover Map - Takes remaining space */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-emerald-200 min-h-[100px] bg-slate-800">
        {/* Using vedur.is cloud cover forecast - green=cloudy, white=clear */}
        <img
          src={cloudCoverUrl}
          alt="Cloud cover forecast for Iceland"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // Try alternative URL first, then fallback
            if (!img.dataset.triedAlt) {
              img.dataset.triedAlt = 'true';
              img.src = cloudCoverAltUrl;
            } else {
              img.src = fallbackMapUrl;
            }
          }}
        />
      </div>
    </div>
  );
};

export default AuroraWidget;
