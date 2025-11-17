'use client';

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";

type CopyButtonProps = {
  text: string;
  label?: string;
  size?: "sm" | "default";
};

export function CopyButton({ text, label = "Copy", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleCopy}
      className="rounded-full"
    >
      {copied ? (
        <>
          <Check className="mr-1.5 size-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1.5 size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
