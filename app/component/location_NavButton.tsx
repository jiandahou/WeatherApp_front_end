"use client"
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation"
import { useDispatch, useSelector } from "react-redux"
import { selectLocation, selectWeatherinfo, selectWeatherinfoArray, setWeatherinfo } from "../store/slice/weatherSlice"
import { AppDispatch } from "../store/store"
import { motion } from "motion/react"
import Image from 'next/image'; 

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
        <motion.button
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        whileHover={{scale:1.1}}
        whileTap={{scale:0.8}}
        layout
         className="ml-1 my-1 flex items-center flex-row px-3 py-1 mr-4 flex-none rounded-lg bg-white-transparent transition-colors duration-150 ease-in-out hover:bg-white/80 shadow-md hover:shadow-xl snap-start" onClick={(e)=>{navButtonOnclick()}}>
            <p className="flex-1 font-medium " >{weather.location!=undefined?weather.location:weathername}</p>
            <Image title={weathername} src={`/${weathername}.svg`} alt="weather" onError={(e)=>(e.currentTarget.src="sun.svg")} className="mx-0.5 w-8" />
            <div className="text-base font-semibold" >{Math.round(weather.temperatureNow)+"°"}</div>
        </motion.button>
        )
    } 