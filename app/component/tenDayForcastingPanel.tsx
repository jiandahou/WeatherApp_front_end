/* eslint-disable react/jsx-key */
"use client"
import clsx from "clsx"
import { ButtonHTMLAttributes, createContext, forwardRef, useContext, useEffect, useRef, useState } from "react"
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation"
import { indexOnPageContext } from "./context"
import { useSelector } from "react-redux"
import { selectWeatherinfo } from "../store/slice/weatherSlice"
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
    let weathername=WeatherCodeInterpretator[weatherForThatDay.weathercode]
    
    // 确保 time 是 Date 对象
    const dateObj = weatherForThatDay.time instanceof Date 
        ? weatherForThatDay.time 
        : new Date(weatherForThatDay.time);
    
    return(
        <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 20 }}  className={clsx(" shrink-0 grow-0",{"basis-36":isActive==false,"basis-72 ":isActive==true})}>
            <motion.button layout className={clsx("h-28 border backdrop-blur-md border-black rounded-lg px-2 button w-full",{" bg-gradient-to-br from-white/30 to-white/10":isActive==false,"bg-white shadow-xl":isActive==true})} onClick={(e)=>onClick()}>
                <div className="text-sm font-semibold">{monthIntepretor[dateObj.getMonth()]} {dateObj.getDate().toString()}</div>
                <div className="text-xs text-gray-600">{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="flex">
                    <Image alt="/weathername.svg" src={`/${weathername}.svg`} width={40} height={40}></Image>
                    <div className="ml-8 flex-1">
                        <div className="flex relative">
                            <div className="text-base font-bold">{weatherForThatDay.highestTemperature.toFixed(1)}°</div>
                            {isActive&&<div className="absolute right-0 text-xs font-medium text-gray-500">{weathername}</div>}
                        </div>
                        <div className="flex relative">
                            <div className="text-base font-bold">{weatherForThatDay.lowestTemperature.toFixed(1)}°</div>
                            {isActive&&<div className="absolute right-0 text-xs text-blue-500 font-medium">{weatherForThatDay.recipitationProbabilityMax}%</div>}
                        </div>
                    </div>
                </div>
            </motion.button>
        </motion.div>

    )
}
export function ButtonPanleForTenDay({onClick}:{onClick:Function}){
    let [indexOnpage,setIndexOnpage]=useState(0)
    var weatherForTenDay=useSelector(selectWeatherinfo)!.daily
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
            <div ref={buttondivref} className="flex overflow-hidden">
            {!(indexOnpage==0)&&
            <button title="turnleft" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-md rounded-full hover:scale-110 transition" onClick={(e)=>{turnleft()}}>
                <svg className="w-6 h-6 rotate-180 fill-gray-700" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="#1A1A1A"></path></svg>
            </button>}
                {weatherForTenDay.weatherForNextTenDay.map((wentherForThatDay,index)=>
                <Buttonforoneday weatherForThatDay={wentherForThatDay} isActive={index==activeOnpage} onClick={()=>{onClick(index)}}></Buttonforoneday>
                )}
            {(indexOnpage+maxButtonnumber.current-offset<buttonNumber.current)&&
            <button title="turnright" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white shadow-md rounded-full hover:scale-110 transition" onClick={(e)=>{turnright()}}>
                <svg className="w-6 h-6 fill-gray-700" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.57107 11.8403C6.90803 12.2987 6 11.8271 6 11.0244V4.97557C6 4.17283 6.90803 3.70129 7.57106 4.1597L11.3555 6.77618C12.2133 7.3693 12.2134 8.63066 11.3555 9.22378L7.57107 11.8403Z" fill="#1A1A1A"></path></svg>
            </button>}
            </div>
        </div>
    )
}
export default function TenDayForcastingPanel({hourlyinfo}:{hourlyinfo:hourlyForecast[]}) {
    var [index,setIndex]=useState(0)
    return(
        <div>
            <indexOnPageContext.Provider value={index} >
            <div><ButtonPanleForTenDay onClick={setIndex}></ButtonPanleForTenDay></div>
            <div><WeatherSVGMotion hourlyinfo={hourlyinfo} /></div>
            </indexOnPageContext.Provider>
        </div>
    )   
};

