import type { weatherdailyinfo, hourlyForecast } from '../type/weatherType';
/* eslint-disable react/jsx-key */
"use client"
import clsx from "clsx"
import { useContext, useEffect, useRef, useState } from "react"
import { resolveWeatherIconFallbackSrc, resolveWeatherIconSrcByCode, resolveWeatherKeyByCode } from "../weatherCode/weatherVisualTokens"
import { indexOnPageContext } from "./context"
import { motion } from "motion/react"
import { WeatherSVGMotion } from "./WeatherSVGMotion"
import Image from 'next/image'

const monthIntepretor:{[key:number]:string}={
    0:"January",
    1:"February",
    2:"March",
    3:"April",
    4:"May",
    5:"June",
    6:"July",
    7:"August",
    8:"September",
    9:"October",
    10:"November",
    11:"December",
}

export function Buttonforoneday({weatherForThatDay,isActive=false,onClick=()=>{return}}:{
    weatherForThatDay:weatherdailyinfo,isActive?:boolean,onClick?:any}
){
    let weathername=resolveWeatherKeyByCode(weatherForThatDay.weathercode)
    const weatherIconSrc = resolveWeatherIconSrcByCode(weatherForThatDay.weathercode)
    const weatherIconFallbackSrc = resolveWeatherIconFallbackSrc()
    
    // 确保 time 是 Date 对象
    const dateObj = weatherForThatDay.time instanceof Date 
        ? weatherForThatDay.time 
        : new Date(weatherForThatDay.time);
    const dayLabel = `${monthIntepretor[dateObj.getMonth()]} ${dateObj.getDate().toString()} ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })}`;
    
    return(
        <motion.div layout transition={{ type: "spring", stiffness: 220, damping: 24 }} className={clsx("shrink-0 grow-0",{"basis-44":isActive==false,"basis-80":isActive==true})}>
            <motion.button
                layout
                type="button"
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Active' : 'Switch to'} forecast day ${dayLabel}. High ${weatherForThatDay.highestTemperature.toFixed(1)} degrees, low ${weatherForThatDay.lowestTemperature.toFixed(1)} degrees, rain ${weatherForThatDay.recipitationProbabilityMax} percent.`}
                className={clsx(
                    "button h-32 w-full rounded-2xl border p-3 text-left text-ui-text-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70",
                    {
                        "panel-surface border-ui-stroke-soft/20":isActive==false,
                        "panel-surface-strong border-ui-accent/40 shadow-panelGlow":isActive==true,
                    }
                )}
                onClick={(e)=>onClick()}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold">{monthIntepretor[dateObj.getMonth()]} {dateObj.getDate().toString()}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-ui-text-3">{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    </div>
                    <Image alt={weathername} src={weatherIconSrc} width={38} height={38} onError={(e) => { (e.target as HTMLImageElement).src = weatherIconFallbackSrc; }} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-2 py-1">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-ui-text-3">High</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap", {"text-[13px]":!isActive, "text-[15px]":isActive})}>{weatherForThatDay.highestTemperature.toFixed(1)}°</div>
                    </div>
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-2 py-1">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-ui-text-3">Low</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap", {"text-[13px]":!isActive, "text-[15px]":isActive})}>{weatherForThatDay.lowestTemperature.toFixed(1)}°</div>
                    </div>
                    <div className="rounded-xl border border-ui-stroke-soft/15 bg-ui-overlay-weak/20 px-2 py-1">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-ui-text-3">Rain</div>
                        <div className={clsx("font-semibold leading-tight tabular-nums whitespace-nowrap text-ui-accent", {"text-[13px]":!isActive, "text-[15px]":isActive})}>{weatherForThatDay.recipitationProbabilityMax}%</div>
                    </div>
                </div>

                {isActive&&<div className="mt-2 text-xs font-medium text-ui-text-2 truncate max-w-full text-ellipsis text-center" style={{overflow:'hidden'}} title={weathername}>{weathername}</div>}
            </motion.button>
        </motion.div>
    )
}
export function ButtonPanleForTenDay({
    onClick,
    weatherForNextTenDay,
}:{
    onClick: Function;
    weatherForNextTenDay: weatherdailyinfo[];
}){
    let [indexOnpage,setIndexOnpage]=useState(0)
    let activeOnpage=useContext(indexOnPageContext)
    let buttondivref=useRef<HTMLDivElement>(null)
    let divref=useRef<HTMLDivElement>(null)
    var buttonNumber=useRef<number>(0)
    let buttonelement=undefined
    let maxButtonnumber=useRef(0)
    useEffect(()=>{
        buttonelement=buttondivref.current!.getElementsByClassName("button")[(activeOnpage!=0)?0:1]
        var margin=parseFloat(window.getComputedStyle(buttonelement).margin)
        maxButtonnumber.current=Math.floor(divref.current!.getBoundingClientRect().width/(buttonelement.getBoundingClientRect().width+margin))
        buttonNumber.current=buttondivref.current!.getElementsByClassName("button").length
    },[activeOnpage])
    function turnleft(){
        let offset=(activeOnpage>indexOnpage-maxButtonnumber.current)?1:0
        let indexToScroll=(indexOnpage-maxButtonnumber.current+offset<0)?0:indexOnpage-maxButtonnumber.current+offset
        buttondivref.current!.getElementsByClassName("button")[indexToScroll].scrollIntoView({inline:"start",block:"center"})
        setIndexOnpage(indexToScroll)    }
    function turnright(){
        let offset=(activeOnpage<indexOnpage+maxButtonnumber.current)?1:0
        let indexToScroll=(indexOnpage+maxButtonnumber.current-offset>=buttonNumber.current)?buttonNumber.current-1:indexOnpage+maxButtonnumber.current-offset
        buttondivref.current!.getElementsByClassName("button")[indexToScroll].scrollIntoView({inline:"start",block:"center"})
        setIndexOnpage(indexToScroll)    }
    let offset=(activeOnpage<indexOnpage+maxButtonnumber.current&&activeOnpage>=indexOnpage)?1:0
    return(
        <div ref={divref} className="relative my-5">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-ui-text-3">Forecast Command Strip</h3>
                    <p className="text-xs text-ui-text-2">Ten-day weather outlook with aligned metric syntax.</p>
                </div>
                <div className="panel-surface rounded-full border border-ui-stroke-soft/15 px-3 py-1 text-xs text-ui-text-2">Day {activeOnpage + 1}</div>
            </div>
            <div ref={buttondivref} className="flex overflow-hidden">
            {!(indexOnpage==0)&&
            <button type="button" aria-label="Scroll forecast left" title="turnleft" className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-ui-text-1 transition hover:scale-110 panel-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70" onClick={(e)=>{turnleft()}}>
                <svg className="w-6 h-6 rotate-180 fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="currentColor"></path></svg>
            </button>}
                {weatherForNextTenDay.map((wentherForThatDay,index)=>
                <Buttonforoneday weatherForThatDay={wentherForThatDay} isActive={index==activeOnpage} onClick={()=>{onClick(index)}}></Buttonforoneday>
                )}
            {(indexOnpage+maxButtonnumber.current-offset<buttonNumber.current)&&
            <button type="button" aria-label="Scroll forecast right" title="turnright" className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-ui-text-1 transition hover:scale-110 panel-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/70" onClick={(e)=>{turnright()}}>
                <svg className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="currentColor"></path></svg>
            </button>}
            </div>
        </div>
    )
}
export default function TenDayForcastingPanel({
    hourlyinfo,
    weatherForNextTenDay,
}:{
    hourlyinfo: hourlyForecast[];
    weatherForNextTenDay: weatherdailyinfo[];
}) {
    var [index,setIndex]=useState(0)
    return(
        <div>
            <indexOnPageContext.Provider value={index} >
            <div><ButtonPanleForTenDay onClick={setIndex} weatherForNextTenDay={weatherForNextTenDay}></ButtonPanleForTenDay></div>
            <div><WeatherSVGMotion key={`weather-curve-${index}`} hourlyinfo={hourlyinfo} /></div>
            </indexOnPageContext.Provider>
        </div>
    )   
};

