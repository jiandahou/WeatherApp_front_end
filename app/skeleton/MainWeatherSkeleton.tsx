import clsx from "clsx";
import { useClock } from "../hooks/useClock";
    import Image from 'next/image';
import { HiddenPanel } from "../component/mainWeatherPanel";

export default function MainWeatherSkeleton() {
    const timeString = useClock();
    return (
        <>
            <div
                className={clsx(
                    "relative rounded-md bg-cover bg-center shadow-xl overflow-visible z-10 bg-cov ",
                    "text-white drop-shadow-md"
                )}
                style={{
                    backgroundImage: `url('/backgrounds/clear-day-bg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="pt-4 text-center sm:text-left">
                    <div className="px-4 max-w-md">
                        <div className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white animate-pulse">
                            <div className="h-6 w-32 bg-gray-300/50 rounded"></div>
                            <div className="mt-2 h-4 w-24 bg-gray-300/50 rounded"></div>
                        </div>
                    </div>

                    <div className="p-4 ">
                        <div className="flex items-center flex-col sm:flex-row justify-between">
                            <div className="flex items-center bg-black/50 backdrop-blur-md rounded-lg p-4 text-white animate-pulse">
                                <div className="h-16 w-16 bg-gray-300/50 rounded-full"></div>
                                <div className="h-16 w-24 bg-gray-300/50 rounded ml-4"></div>
                            </div>

                            <div className="mx-5 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white animate-pulse">
                                <div className="h-7 w-24 bg-gray-300/50 rounded mb-2"></div>
                                <div className="h-6 w-20 bg-gray-300/50 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="my-6 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white max-w-fit animate-pulse">
                        <div className="h-4 w-40 bg-gray-300/50 rounded"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:justify-between gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white animate-pulse">
                                <div className="h-6 w-24 bg-gray-300/50 rounded mb-2"></div>
                                <div className="h-4 w-16 bg-gray-300/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}