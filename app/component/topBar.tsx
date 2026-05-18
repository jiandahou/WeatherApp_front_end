"use client"
import ScollContainerMeun from "./scoll_Container_Meun";
import WeatherLocationSearchBar from "./weather_Location_SearchBar";
export default function TopBar() {
        return(
            <div data-weather-topbar className="mb-4 flex w-full flex-col gap-2 rounded-2xl border border-ui-stroke-soft/25 bg-ui-surface-1/55 px-3 py-3 backdrop-blur-sm sm:mb-5 sm:flex-row sm:items-start sm:justify-start sm:gap-0 sm:px-4 sm:py-4 overflow-visible z-50 relative">
                <WeatherLocationSearchBar/>
                <ScollContainerMeun/>
            </div>
        )
};

