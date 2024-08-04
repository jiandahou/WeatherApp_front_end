import { MouseEventHandler } from "react"
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation"
export default function LocationNavButton({onClick=()=>{},weather}:{
       weather:locationWeather,
       onClick?:MouseEventHandler
    }){
        let weathername=WeatherCodeInterpretator[weather.weatherCode]
    return(
        <button className="flex flex-row w-36 h-7 mr-4 flex-none rounded-lg bg-white-transparent " onClick={(e)=>{onClick(e)}}>
            <p className=" truncate" >{weather.location!=undefined?weather.location:weathername}</p>
            <img title={weathername} src={weathername+".svg" } onError={(e)=>(e.currentTarget.src="sun.svg")} className="mx-0.5 w-8"></img>
            <div >{Math.round(weather.temperatureNow)+"°"}</div>
        </button>
        )
    } 