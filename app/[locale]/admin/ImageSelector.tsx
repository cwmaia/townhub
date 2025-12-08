'use client';

type CandidateImage = {
  url: string;
  source: "streetview" | "google-places";
  heading?: number;
  date?: string;
};

type ImageSelectorProps = {
  images: CandidateImage[];
  selected?: string;
  onSelect: (url: string) => void;
};

export function ImageSelector({ images, selected, onSelect }: ImageSelectorProps) {
  if (images.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        No candidate images were found.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Candidate images
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {images.map((image) => (
          <button
            key={image.url}
            onClick={() => onSelect(image.url)}
            className={`group relative overflow-hidden rounded-2xl border p-1 transition ${
              selected === image.url
                ? "border-primary bg-primary/5"
                : "border-slate-200 bg-white hover:border-slate-400"
            }`}
          >
            <img
              src={image.url}
              alt={image.source}
              className="h-32 w-full object-cover transition brightness-90 group-hover:brightness-100"
              loading="lazy"
            />
            <div className="mt-1 flex items-center justify-between px-2 text-[11px] text-slate-500">
              <span>{image.source === "streetview" ? "Street View" : "Google"}</span>
              {image.heading ? <span>{image.heading}°</span> : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
