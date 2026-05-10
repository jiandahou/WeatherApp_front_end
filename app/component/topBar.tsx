"use client"
import ScollContainerMeun from "./scoll_Container_Meun";
import WeatherLocationSearchBar from "./weather_Location_SearchBar";
export default function TopBar() {
        return(
            <div className="mb-5 rounded-xl px-3 py-3 sm:px-4 sm:py-4 flex-col flex sm:flex-row sm:items-start sm:justify-start gap-0 bg-ui-surface-1/35 border border-ui-stroke-soft/20 backdrop-blur-sm overflow-x-hidden overflow-y-visible z-50 relative">
                <WeatherLocationSearchBar/>
                <ScollContainerMeun/>
            </div>
        )
};

