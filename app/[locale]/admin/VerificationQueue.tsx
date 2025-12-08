'use client';

import { useState } from "react";
import { PlaceVerifyCard } from "./PlaceVerifyCard";

export type PlaceToVerify = {
  id: string;
  name: string;
  address?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  imageUrl?: string | null;
  locationVerified?: boolean | null;
  imageVerified?: boolean | null;
};

type CandidateImage = {
  url: string;
  source: "streetview" | "google-places";
  heading?: number;
  date?: string;
  panoId?: string;
};

type VerificationResult = {
  candidateImages: CandidateImage[];
  driftMeters: number | null;
  googlePlace: {
    placeId: string;
    name: string;
    address?: string;
    lat: number;
    lng: number;
  } | null;
  maps: {
    ours: string;
    google: string | null;
  };
};

type PlaceState = {
  isVerifying: boolean;
  isApproving: boolean;
  selectedImage?: string;
  result?: VerificationResult;
  error?: string;
};

type VerificationQueueProps = {
  places: PlaceToVerify[];
};

export function VerificationQueue({ places }: VerificationQueueProps) {
  const [states, setStates] = useState<Record<string, PlaceState>>({});
  const [bulkMessage, setBulkMessage] = useState<string>("");

  const handleVerify = async (placeId: string) => {
    setStates((prev) => ({
      ...prev,
      [placeId]: { ...(prev[placeId] ?? {}), isVerifying: true, error: undefined },
    }));

    try {
      const response = await fetch("/api/places/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch verification data");
      }
      const data = await response.json();
      setStates((prev) => ({
        ...prev,
        [placeId]: {
          ...(prev[placeId] ?? {}),
          isVerifying: false,
          result: data,
          selectedImage: data.candidateImages?.[0]?.url,
        },
      }));
    } catch (error) {
      console.error(error);
      setStates((prev) => ({
        ...prev,
        [placeId]: {
          ...(prev[placeId] ?? {}),
          isVerifying: false,
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  };

  const handleApprove = async (placeId: string) => {
    const state = states[placeId];
    if (!state?.result) {
      return;
    }
    setStates((prev) => ({
      ...prev,
      [placeId]: { ...(prev[placeId] ?? {}), isApproving: true, error: undefined },
    }));

    try {
      const response = await fetch("/api/places/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          imageUrl: state.selectedImage,
          lat: state.result.googlePlace?.lat,
          lng: state.result.googlePlace?.lng,
          googlePlaceId: state.result.googlePlace?.placeId,
          driftMeters: state.result.driftMeters,
          streetViewPanoId: undefined,
          streetViewDate: undefined,
          candidateImageUrls: state.result.candidateImages.map((img) => img.url),
          verifyImage: true,
          verifyLocation: true,
        }),
      });
      if (!response.ok) {
        throw new Error("Approval failed");
      }
      const updated = await response.json();
      setStates((prev) => ({
        ...prev,
        [placeId]: {
          ...(prev[placeId] ?? {}),
          isApproving: false,
          result: undefined,
          selectedImage: undefined,
        },
      }));
    } catch (error) {
      console.error(error);
      setStates((prev) => ({
        ...prev,
        [placeId]: {
          ...(prev[placeId] ?? {}),
          isApproving: false,
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  };

  const handleSelectImage = (placeId: string, url: string) => {
    setStates((prev) => ({
      ...prev,
      [placeId]: {
        ...(prev[placeId] ?? {}),
        selectedImage: url,
      },
    }));
  };

  const handleBulkVerify = async () => {
    setBulkMessage("Queueing verification...");
    try {
      const response = await fetch("/api/places/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: places.map((place) => place.id) }),
      });
      if (!response.ok) {
        throw new Error("Bulk verification failed");
      }
      const data = await response.json();
      setBulkMessage(`Queued ${data.updated} places for verification.`);
    } catch (error) {
      setBulkMessage(
        error instanceof Error ? error.message : "Bulk verification failed"
      );
    }
  };

  if (places.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">All places have been verified.</p>
      </section>
    );
  }

  return (
    <section id="verification" className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Verification queue</h2>
          <p className="text-sm text-slate-500">
            Pull Google Street View imagery and approve the best match for each place.
          </p>
        </div>
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={handleBulkVerify}
        >
          Queue all for verification
        </button>
      </div>
      {bulkMessage && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {bulkMessage}
        </div>
      )}
      <div className="space-y-4">
        {places.map((place) => (
          <PlaceVerifyCard
            key={place.id}
            place={place}
            state={states[place.id]}
            onVerify={() => handleVerify(place.id)}
            onApprove={() => handleApprove(place.id)}
            onSelectImage={(url) => handleSelectImage(place.id, url)}
          />
        ))}
      </div>
    </section>
  );
}
