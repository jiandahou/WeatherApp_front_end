"use client"
import { forwardRef, LegacyRef, MouseEventHandler, useMemo } from "react";
import LocationNavButton from "./location_NavButton";
import {  useSelector } from "react-redux";
import {  selectWeatherinfoArray} from "../store/slice/weatherSlice";
export type Ref = HTMLDivElement;
type Props={
}
 const LocationNavButtonPanel= forwardRef<Ref,Props>(function LocationNavButtonPanel(props,ref
){
    var weatherinfoArray=useSelector(selectWeatherinfoArray)
    var LocationInfoList=useMemo(
        () => weatherinfoArray.map((w) => w!.daily),
        [weatherinfoArray]
      )
    return(<div className="overflow-hidden shrink relative  ">
            <div className="flex flex-row relative " ref={ref}>
            {LocationInfoList.map(locationInfo=>
                <LocationNavButton weather={locationInfo!} key={locationInfo!.location}></LocationNavButton>
            )}
            </div>
        </div>)
})
export default LocationNavButtonPanel