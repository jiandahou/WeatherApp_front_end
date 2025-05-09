"use client"
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation"
import { useDispatch, useSelector } from "react-redux"
import { selectLocation, selectWeatherinfo, selectWeatherinfoArray, setWeatherinfo } from "../store/slice/weatherSlice"
import { AppDispatch } from "../store/store"
export default function LocationNavButton({weather}:{
       weather:locationWeather,
        }){
        let weathername=WeatherCodeInterpretator[weather.weatherCode]
        var weatherinfoArray=useSelector(selectWeatherinfoArray)
        const cityName=weather.location
        const dispatch = useDispatch<AppDispatch>();
        function navButtonOnclick(){
            let weatherinfo=weatherinfoArray.find((weatherinfo)=>{return weatherinfo?.daily.location==cityName})
            console.log(weatherinfo)
            if(weatherinfo!=undefined){
                dispatch(setWeatherinfo(weatherinfo));
        }}
    return(
        <button className="flex items-center flex-row px-3 py-1 mr-4 flex-none rounded-lg bg-white-transparent transition-colors duration-150 ease-in-out hover:bg-white/80 shadow-md hover:shadow-xl snap-start" onClick={(e)=>{navButtonOnclick()}}>
            <p className="flex-1 font-medium " >{weather.location!=undefined?weather.location:weathername}</p>
            <img title={weathername} src={weathername+".svg" } onError={(e)=>(e.currentTarget.src="sun.svg")} className="mx-0.5 w-8"></img>
            <div className="text-base font-semibold" >{Math.round(weather.temperatureNow)+"°"}</div>
        </button>
        )
    } 