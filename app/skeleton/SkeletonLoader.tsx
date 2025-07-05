import ScollContainerMeun from "../component/scoll_Container_Meun";
import WeatherLocationSearchBar from "../component/weather_Location_SearchBar";
import MainWeatherSkeleton from "./MainWeatherSkeleton";
import { TenDayButtonSkeleton } from "./TenDayButtonSkeleton";
import { WeatherSVGSkeleton } from "./WeatherSVGSkeleton";

export default function SkeletonLoader() {
    return (
        <div className=" space-y-8">
            {/* TopBar 占位 */}
                <div className="flex-col flex sm:flex-row mb-5">
                    <WeatherLocationSearchBar/>
                    <ScollContainerMeun/>
                </div>
            {/* MainWeatherPanel 占位 */}
            <MainWeatherSkeleton></MainWeatherSkeleton>
            {/* 10天预报面板 */}
            <TenDayButtonSkeleton></TenDayButtonSkeleton>
            {/* 折线图占位 */}
            <WeatherSVGSkeleton></WeatherSVGSkeleton>
            {/* 底部四项指标 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-300/70 rounded"></div>
                ))}
            </div>
        </div>
    );
}