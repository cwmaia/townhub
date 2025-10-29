'use client';

import { Sparkles } from "lucide-react";

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

  if (!auroraData) {
    return (
      <div className="flex flex-col justify-between rounded-2xl bg-emerald-500/5 p-2.5 text-emerald-700">
        <div className="flex items-center gap-1.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white shadow">
            <Sparkles className="size-3.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-emerald-700/70">
              Aurora Forecast
            </p>
            <p className="text-sm font-semibold text-emerald-700">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const level = getAuroraLevel(auroraData.kpIndex);

  return (
    <div className={`flex flex-col rounded-2xl ${level.bgColor} p-2.5 ${level.color}`}>
      <div className="flex items-center gap-1.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-white shadow">
          <Sparkles className="size-3.5 text-emerald-500" />
        </div>
        <div>
          <p className={`text-[9px] uppercase tracking-wide ${level.color}/70`}>
            Aurora Forecast
          </p>
          <p className={`text-sm font-semibold ${level.color}`}>
            {level.label} Activity
          </p>
        </div>
      </div>
      <div className={`mt-1.5 flex flex-col gap-0.5 text-[10px] ${level.color}/80`}>
        <div className="flex justify-between">
          <span>Kp-Index:</span>
          <span className="font-semibold">{auroraData.kpIndex}/9</span>
        </div>
        <div className="flex justify-between">
          <span>Visibility:</span>
          <span className="font-semibold">{auroraData.probability}%</span>
        </div>
      </div>
      <p className={`mt-1 text-[10px] leading-tight ${level.color}/70`}>{auroraData.description}</p>
    </div>
  );
};

export default AuroraWidget;
