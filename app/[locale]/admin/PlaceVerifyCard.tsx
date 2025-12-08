'use client';

import { LocationCompare } from "./LocationCompare";
import { ImageSelector } from "./ImageSelector";
import { PlaceToVerify } from "./VerificationQueue";

type CandidateImage = {
  url: string;
  source: "streetview" | "google-places";
  heading?: number;
  date?: string;
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
  isVerifying?: boolean;
  isApproving?: boolean;
  selectedImage?: string;
  result?: VerificationResult;
  error?: string;
};

type PlaceVerifyCardProps = {
  place: PlaceToVerify;
  state?: PlaceState;
  onVerify: () => void;
  onApprove: () => void;
  onSelectImage: (url: string) => void;
};

export function PlaceVerifyCard({
  place,
  state,
  onVerify,
  onApprove,
  onSelectImage,
}: PlaceVerifyCardProps) {
  const canVerify = Boolean(place.lat && place.lng);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-900">{place.name}</p>
        <p className="text-xs text-slate-500">{place.address ?? place.location}</p>
        <p className="text-xs text-slate-400">
          Verified: {place.locationVerified ? "Yes" : "No"} / Image:{" "}
          {place.imageVerified ? "Yes" : "No"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
          onClick={onVerify}
          disabled={!canVerify || state?.isVerifying}
        >
          {state?.isVerifying ? "Fetching..." : "Fetch Google data"}
        </button>
        <button
          className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400"
          onClick={onApprove}
          disabled={!state?.result || state?.isApproving}
        >
          {state?.isApproving ? "Approving..." : "Approve selection"}
        </button>
      </div>

      {state?.error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}

      {state?.result ? (
        <div className="mt-4 space-y-3">
          <ImageSelector
            images={state.result.candidateImages}
            selected={state.selectedImage}
            onSelect={onSelectImage}
          />
          <LocationCompare
            maps={state.result.maps}
            driftMeters={state.result.driftMeters}
            googleLabel={state.result.googlePlace?.name}
          />
        </div>
      ) : null}
    </div>
  );
}
