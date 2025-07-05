export function TenDayButtonSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="h-28 w-36 bg-black/50 backdrop-blur-md rounded-lg p-2 animate-pulse flex flex-col justify-between"
        >
          <div className="h-5 w-24 bg-gray-300/50 rounded mb-1"></div>
          <div className="h-4 w-20 bg-gray-300/50 rounded mb-2"></div>
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-300/50 rounded-full"></div>
            <div className="ml-4 flex flex-col gap-1">
              <div className="h-4 w-10 bg-gray-300/50 rounded"></div>
              <div className="h-4 w-10 bg-gray-300/50 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
