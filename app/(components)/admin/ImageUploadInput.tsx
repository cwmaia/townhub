'use client';

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

type ImageUploadInputProps = {
  label: string;
  name: string;
  folder: string;
  helperText?: string;
  defaultValue?: string;
  multiple?: boolean;
};

export function ImageUploadInput({
  label,
  name,
  folder,
  helperText,
  defaultValue,
  multiple = false,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<string>(() => defaultValue ?? "");
  const [values, setValues] = useState<string[]>(() =>
    defaultValue ? defaultValue.split(",").map((item) => item.trim()).filter(Boolean) : []
  );

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (url: string) => {
    if (multiple) {
      setValues((prev) => prev.filter((item) => item !== url));
    } else {
      setValue("");
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }

        const data = (await response.json()) as { url: string };
        uploadedUrls.push(data.url);
      }

      if (multiple) {
        setValues((prev) => [...prev, ...uploadedUrls]);
      } else {
        setValue(uploadedUrls[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelect}
          disabled={uploading}
        >
          <Upload className="mr-2 size-4" />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple={multiple}
        onChange={(event) => handleUpload(event.target.files)}
      />

      {helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      {multiple ? (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-dashed border-slate-200 p-3">
          {values.map((url) => (
            <div key={url} className="relative overflow-hidden rounded-lg border border-slate-100">
              <Image
                src={url}
                alt={label}
                width={160}
                height={120}
                className="h-24 w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-slate-600 shadow"
                onClick={() => handleRemove(url)}
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {!values.length ? (
            <div className="col-span-3 text-center text-xs text-slate-400">
              No images yet. Upload to populate the gallery.
            </div>
          ) : null}
          <input type="hidden" name={name} value={values.join(",")} />
        </div>
      ) : (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-dashed border-slate-200",
            value ? "bg-white" : "bg-slate-50"
          )}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt={label}
                width={400}
                height={200}
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-slate-600 shadow"
                onClick={() => handleRemove(value)}
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-slate-400">
              No image uploaded
            </div>
          )}
          <input type="hidden" name={name} value={value} />
        </div>
      )}
    </div>
  );
}
