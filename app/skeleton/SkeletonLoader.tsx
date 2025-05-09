export default function SkeletonLoader() {
    return (
        <div className="space-y-4 w-4/5 mx-auto animate-pulse">
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-40 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-300 rounded"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
            </div>
            <div className="h-32 bg-gray-300 rounded"></div>
        </div>
    );
}