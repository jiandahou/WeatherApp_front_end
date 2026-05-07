"use client";

import { useEffect } from "react";

/**
 * Global error boundary (app/error.tsx).
 * Catches unhandled errors anywhere in the app tree.
 * The `reset` function re-renders the segment to attempt recovery.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-gray-400 text-sm max-w-md text-center">
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
