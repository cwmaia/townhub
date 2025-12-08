'use client';

import { useEffect, useState } from 'react';

type RoadConditionsWidgetProps = {
  townCenter: { lat: number; lng: number };
};

type RoadCondition = {
  id: string;
  condition: {
    description: string;
    code: string;
    date: string;
  };
  roads: { name: string }[];
};

type RouteCondition = {
  name: string;
  status: 'easy' | 'slippery' | 'difficult' | 'closed' | 'unknown';
  description: string;
  segments: number;
};

// Map condition codes to status
const getStatusFromCode = (code: string): 'easy' | 'slippery' | 'difficult' | 'closed' | 'unknown' => {
  const codeNum = parseInt(code);
  if (codeNum === 14) return 'easy'; // Greiðfært
  if ([23, 26].includes(codeNum)) return 'slippery'; // Hálkublettir
  if ([36, 39, 46, 47, 48, 49].includes(codeNum)) return 'difficult'; // Hált, snow
  if ([56, 123, 124, 125].includes(codeNum)) return 'closed'; // Ófært
  return 'unknown';
};

const getStatusColor = (status: RouteCondition['status']) => {
  switch (status) {
    case 'easy': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
    case 'slippery': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
    case 'difficult': return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
    case 'closed': return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  }
};

const getStatusLabel = (status: RouteCondition['status']) => {
  switch (status) {
    case 'easy': return 'Clear';
    case 'slippery': return 'Icy spots';
    case 'difficult': return 'Slippery';
    case 'closed': return 'Closed';
    default: return 'Unknown';
  }
};

// Get worst condition from multiple segments
const getWorstStatus = (statuses: RouteCondition['status'][]): RouteCondition['status'] => {
  const priority = ['closed', 'difficult', 'slippery', 'easy', 'unknown'] as const;
  for (const p of priority) {
    if (statuses.includes(p)) return p;
  }
  return 'unknown';
};

const RoadConditionsWidget = ({ townCenter }: RoadConditionsWidgetProps) => {
  const [routeConditions, setRouteConditions] = useState<RouteCondition[]>([]);
  const [overallStatus, setOverallStatus] = useState<RouteCondition['status']>('unknown');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const roadMapUrl = 'https://umferdin.is/en';

  useEffect(() => {
    const fetchRoadConditions = async () => {
      try {
        const response = await fetch('/api/road-conditions');

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const results: RoadCondition[] = data?.data?.RoadCondition?.results || [];

        if (results.length === 0) {
          throw new Error('No road data available');
        }

        // Filter for roads relevant to Route 54 (Stykkishólmur to Borgarnes)
        // Using partial matching to catch variations
        const relevantPatterns = [
          'Snæfellsnes',    // Route 54 main road
          'Stykkishólm',    // To Stykkishólmur
          'Borgarfjörð',    // Borgarfjörður area
          'Borgarfjarð',    // Alternative spelling
        ];

        const routeData: Record<string, { statuses: RouteCondition['status'][], descriptions: string[] }> = {};
        let latestDate = '';

        for (const result of results) {
          for (const road of result.roads) {
            const matchesPattern = relevantPatterns.some(pattern =>
              road.name.toLowerCase().includes(pattern.toLowerCase())
            );

            if (matchesPattern) {
              const roadName = road.name;
              if (!routeData[roadName]) {
                routeData[roadName] = { statuses: [], descriptions: [] };
              }
              const status = getStatusFromCode(result.condition.code);
              routeData[roadName].statuses.push(status);
              if (!routeData[roadName].descriptions.includes(result.condition.description)) {
                routeData[roadName].descriptions.push(result.condition.description);
              }
              if (result.condition.date > latestDate) {
                latestDate = result.condition.date;
              }
            }
          }
        }

        const conditions: RouteCondition[] = Object.entries(routeData).map(([name, data]) => ({
          name,
          status: getWorstStatus(data.statuses),
          description: data.descriptions.join(', '),
          segments: data.statuses.length
        }));

        // Sort by worst condition first
        conditions.sort((a, b) => {
          const priority = ['closed', 'difficult', 'slippery', 'easy', 'unknown'];
          return priority.indexOf(a.status) - priority.indexOf(b.status);
        });

        setRouteConditions(conditions);
        setOverallStatus(conditions.length > 0 ? getWorstStatus(conditions.map(c => c.status)) : 'unknown');
        setError(false);

        if (latestDate) {
          const date = new Date(latestDate);
          setLastUpdate(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch road conditions:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchRoadConditions();
    // Refresh every 10 minutes
    const interval = setInterval(fetchRoadConditions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const overallColor = getStatusColor(overallStatus);

  return (
    <div className="flex flex-col rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 h-full min-h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Road Conditions
          </span>
        </div>
        <a
          href={roadMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          umferdin.is →
        </a>
      </div>

      {/* Route info row with live status */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">Route 54</p>
          <p className="text-[11px] text-amber-600">Stykkishólmur → Borgarnes</p>
        </div>
        <div className="text-right">
          {loading ? (
            <div className="h-6 w-16 bg-slate-200 animate-pulse rounded" />
          ) : (
            <div className={`${overallColor.bg} px-2 py-1 rounded-lg`}>
              <span className={`text-xs font-bold ${overallColor.text}`}>
                {getStatusLabel(overallStatus)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live road segment conditions */}
      <div className="space-y-1 mb-2">
        {loading ? (
          <div className="space-y-1">
            {[1, 2].map(i => (
              <div key={i} className="h-5 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-2">
            <p className="text-xs text-slate-500">Unable to load conditions</p>
          </div>
        ) : routeConditions.length > 0 ? (
          routeConditions.slice(0, 4).map((route) => {
            const color = getStatusColor(route.status);
            return (
              <div key={route.name} className={`flex items-center gap-2 ${color.bg} rounded-lg px-2 py-0.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                <span className="text-[9px] font-medium text-slate-700 flex-1 truncate">
                  {route.name}
                </span>
                <span className={`text-[9px] font-bold ${color.text}`}>
                  {getStatusLabel(route.status)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-2">
            <p className="text-xs text-slate-500">No data for this route</p>
          </div>
        )}
      </div>

      {/* Map with route */}
      <a
        href={roadMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 relative overflow-hidden rounded-xl border border-amber-200 min-h-[100px] bg-slate-100 group"
      >
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=64.85,-22.2&zoom=7&size=600x200&scale=2&maptype=terrain&markers=color:green|label:S|65.075,-22.73&markers=color:red|label:B|64.538,-21.92&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyA3MSCsqQr282qPM52kjTCiHp8VQT91XNQ'}`}
          alt="Route from Stykkishólmur to Borgarnes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between">
          <div className="flex items-center gap-0.5 rounded bg-white/90 px-1 py-0.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] font-medium text-slate-700">Stykkishólmur</span>
          </div>
          <div className="flex items-center gap-0.5 rounded bg-white/90 px-1 py-0.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="text-[8px] font-medium text-slate-700">Borgarnes</span>
          </div>
        </div>
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow">
            View full map →
          </span>
        </div>
      </a>

    </div>
  );
};

export default RoadConditionsWidget;
