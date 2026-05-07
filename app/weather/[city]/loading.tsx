import LoadingSkeleton from "@/app/skeleton/LoadingSkeleton";

/**
 * Streaming loading UI for /weather/[city].
 * Shown by Next.js while the server fetches city + weather data.
 */
export default function CityLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <LoadingSkeleton />
    </div>
  );
}
