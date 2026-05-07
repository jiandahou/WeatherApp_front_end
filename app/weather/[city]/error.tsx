"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary for /weather/[city].
 * Handles fetch failures (city not found, backend down, etc.)
 * and gives the user a clear recovery path.
 */
export default function CityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CityError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-semibold">Failed to load weather data</h2>
      <p className="text-gray-400 text-sm max-w-md text-center">
        {error.message ?? "Could not fetch weather for this city. The service may be temporarily unavailable."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
