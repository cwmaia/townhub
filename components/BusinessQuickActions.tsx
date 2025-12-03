'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  {
    label: "Send notification",
    description: "Reach followers with a quick push or email.",
  },
  {
    label: "Create event",
    description: "Schedule a pop-up or promo to boost engagement.",
  },
];

export function BusinessQuickActions() {
  const [status, setStatus] = useState<string>("");

  const handleAction = (label: string) => {
    setStatus(`${label} is coming soon!`);
    window.setTimeout(() => setStatus(""), 2600);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex-col items-start gap-1 text-left"
            onClick={() => handleAction(action.label)}
          >
            <span className="text-sm font-semibold">{action.label}</span>
            <span className="text-[11px] text-slate-500">{action.description}</span>
          </Button>
        ))}
      </div>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
