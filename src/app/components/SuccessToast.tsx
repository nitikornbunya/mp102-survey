"use client";

import { useEffect } from "react";

type Props = {
  show: boolean;
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export default function SuccessToast({
  show,
  message,
  onClose,
  durationMs = 3000,
}: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [show, onClose, durationMs]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-lg shadow-zinc-900/10 ring-1 ring-emerald-100"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="font-medium text-emerald-800">{message}</p>
      </div>
    </div>
  );
}
