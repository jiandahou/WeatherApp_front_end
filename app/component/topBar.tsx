"use client"
import ScollContainerMeun from "./scoll_Container_Meun";
import WeatherLocationSearchBar from "./weather_Location_SearchBar";
export default function TopBar() {
        return(
            <div className="flex-col flex sm:flex-row mb-5">
                <WeatherLocationSearchBar/>
                <ScollContainerMeun/>
            </div>
        )
};

