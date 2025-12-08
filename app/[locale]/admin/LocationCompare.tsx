'use client';

type LocationCompareProps = {
  maps: {
    ours: string;
    google: string | null;
  };
  driftMeters?: number | null;
  googleLabel?: string | null;
};

export function LocationCompare({ maps, driftMeters, googleLabel }: LocationCompareProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">Location comparison</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Our pin</p>
          <img src={maps.ours} alt="Our location" className="h-32 w-full rounded-2xl object-cover" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Google {googleLabel ?? "Labeled location"}
          </p>
          {maps.google ? (
            <img
              src={maps.google}
              alt="Google location"
              className="h-32 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="h-32 w-full rounded-2xl border border-dashed border-slate-200 bg-white/40" />
          )}
        </div>
      </div>
      {driftMeters != null ? (
        <p className="text-xs text-slate-500">
          Drift: <span className="font-semibold text-slate-900">{driftMeters} meters</span>
        </p>
      ) : null}
    </div>
  );
}
