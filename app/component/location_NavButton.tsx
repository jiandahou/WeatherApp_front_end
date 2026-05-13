"use client"
import { useDispatch, useSelector } from "react-redux"
import { selectWeatherinfoArray, setWeatherinfo } from "../store/slice/weatherSlice"
import { AppDispatch } from "../store/store"
import { motion, useReducedMotion } from "motion/react"
import Image from 'next/image'; 
import type { locationWeather } from "../type/weatherType";
import { resolveWeatherIconFallbackSrc, resolveWeatherIconSrcByCode, resolveWeatherKeyByCode } from "../weatherCode/weatherVisualTokens";

export default function LocationNavButton({weather}:{
       weather:locationWeather,
        }){
        let weathername=resolveWeatherKeyByCode(weather.weatherCode)
    const weatherIconSrc = resolveWeatherIconSrcByCode(weather.weatherCode)
    const weatherIconFallbackSrc = resolveWeatherIconFallbackSrc()
    var weatherinfoArray=useSelector(selectWeatherinfoArray)
    const cityName=weather.location
    const shouldReduceMotion = useReducedMotion();
    const dispatch = useDispatch<AppDispatch>();

        function navButtonOnclick(){
            const cached = weatherinfoArray.find((weatherinfo)=> weatherinfo?.daily.location === cityName)
            if(cached){
                dispatch(setWeatherinfo(cached));
            }
        }
    return(
        <motion.button
        type="button"
        initial={{opacity:0,y:shouldReduceMotion?0:12}}
        animate={{opacity:1,y:0}}
        whileHover={shouldReduceMotion?undefined:{scale:1.04}}
        whileTap={shouldReduceMotion?undefined:{scale:0.98}}
        layout
        aria-label={`Switch weather focus to ${cityName ?? weathername}`}
        className="my-1 ml-1 mr-2 flex flex-none snap-start flex-row items-center rounded-lg border border-ui-stroke-soft/50 bg-ui-surface-1/70 px-2 py-1.5 text-sm backdrop-blur-sm shadow-panelSoft transition-all duration-150 ease-in-out hover:bg-ui-surface-2/80 hover:shadow-panelGlow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70 sm:mr-4 sm:px-3 sm:py-2 sm:text-base"
        onClick={(e)=>{navButtonOnclick()}}>
            <p className="flex-1 max-w-[7.5rem] truncate font-medium text-ui-text-1 sm:max-w-none" >{weather.location!=undefined?weather.location:weathername}</p>
            <Image title={weathername} src={weatherIconSrc} alt="weather" width={32} height={32} onError={(e)=>(e.currentTarget.src=weatherIconFallbackSrc)} className="mx-1 h-7 w-7 sm:h-8 sm:w-8" />
            <div className="font-semibold text-ui-text-1" >{Math.round(weather.temperatureNow)+"°"}</div>
        </motion.button>
        )
    } 