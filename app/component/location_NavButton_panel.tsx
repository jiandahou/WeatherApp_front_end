"use client"
import { forwardRef, LegacyRef, MouseEventHandler, useMemo } from "react";
import LocationNavButton from "./location_NavButton";
import {  useSelector } from "react-redux";
import {  selectWeatherinfoArray} from "../store/slice/weatherSlice";
import { motion } from "motion/react";
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
    return(<div className="relative flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.div className="relative flex flex-row" ref={ref} >
            {LocationInfoList.map(locationInfo=>
                <LocationNavButton weather={locationInfo!} key={`${locationInfo!.location}-${locationInfo!.country ?? 'unknown'}`}></LocationNavButton>
            )}
            </motion.div>
        </div>)
})
export default LocationNavButtonPanel
