"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShareButton({ title, url, text, className = "", children }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + (url.startsWith("/") ? url : "/" + url) : url);
    const shareText = text || `Check this out: ${title}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (typeof window !== "undefined") {
        window.prompt("Copy this link:", shareUrl);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className || "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"}
    >
      {children ?? (
        <>
          {copied ? "Link copied!" : "Share"}
        </>
      )}
    </button>
  );
}
