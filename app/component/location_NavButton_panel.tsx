import { forwardRef, LegacyRef, MouseEventHandler } from "react";
import LocationNavButton from "./location_NavButton";
export type Ref = HTMLDivElement;
type Props={
    LocationInfoList:Array<locationWeather>
    onClick?:MouseEventHandler
}
 const LocationNavButtonPanel= forwardRef<Ref,Props>(function LocationNavButtonPanel(props,ref
){var LocationInfoList=props.LocationInfoList
    const {onClick=()=>{}}=props
    return(<div className="overflow-hidden">
            <div className="flex flex-row relative" ref={ref}>
            {LocationInfoList.map(locationInfo=>
                <LocationNavButton weather={locationInfo} key={locationInfo.location} onClick={onClick} ></LocationNavButton>
            )}
            </div>
        </div>)
})
export default LocationNavButtonPanel