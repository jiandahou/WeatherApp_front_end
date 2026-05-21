"use client";

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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ui-bg-0 text-ui-text-1">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-ui-text-3 text-sm max-w-md text-center">
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-ui-accent px-5 py-2 text-sm font-medium text-ui-bg-2 hover:bg-ui-accent-muted transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
