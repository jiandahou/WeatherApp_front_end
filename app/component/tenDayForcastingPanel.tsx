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
const weekdayIntepretor:{[key:number]:string}={
    0:"Monday",
    1:"Tuesday",
    2:"Wednesday",
    3:"Thursday",
    4:"Firday",
    5:"Saturday",
    6:"Sunday"
}
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
function TempertureToColor(temp:number):string{
    if(temp<0){
        return "rgb(139, 164, 241)"
    }
    else if(temp<=2){
        return "rgb(143, 200, 255)"
    }
    else if(temp<=4){
        return "rgb(138, 227, 245)"
    }
    else if(temp<=7){
        return "rgb(131, 239, 212)"
    }
    else if(temp<=12){
        return "rgb(166, 255, 192)"
    }
    else if(temp<=15){
        return "rgb(194, 255, 161)"
    }
    else if(temp<=18){
        return "rgb(166, 255, 192)"
    }
    else if(temp<=21){
        return "rgb(194, 255, 161)"
    }
    else if(temp<=23){
        return "rgb(255, 219, 140)"
    }
    else if(temp<=28){
        return "rgb(255, 200, 148)"
    }
    else if(temp<=31){
        return "rgb(255, 143, 123)"
    }
    else if(temp<=37){
        return "rgb(255, 123, 119)"
    }
    else{
        return "rgb(232, 103, 127)"
    }
}
export function Buttonforoneday({weatherForThatDay,isActive=false,onClick=()=>{return}}:{
    weatherForThatDay:weatherdailyinfo,isActive?:boolean,onClick?:any}
){let weathername=WeatherCodeInterpretator[weatherForThatDay.weathercode]
    return(
        <motion.div layout transition={{ type: "spring", stiffness: 200, damping: 20 }}  className={clsx(" shrink-0 grow-0",{"basis-36":isActive==false,"basis-72 ":isActive==true})}>
            <motion.button layout className={clsx("h-28 border backdrop-blur-md border-black rounded-lg px-2 button w-full",{" bg-gradient-to-br from-white/30 to-white/10":isActive==false,"bg-white shadow-xl":isActive==true})} onClick={(e)=>onClick()}>
                <div className="text-sm font-semibold">{monthIntepretor[weatherForThatDay.time.getMonth()]} {weatherForThatDay.time.getDate().toString()}</div>
                <div className="text-xs text-gray-600">{new Date(weatherForThatDay.time).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="flex">
                    <img alt="weathername.svg" src={weathername+".svg" } width={40} height={40}></img>
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
        console.log("maxButtonnumber.current" +maxButtonnumber.current)
        console.log("indexOnpage"+indexOnpage)
    },[activeOnpage])
    function turnleft(){
        let offset=(activeOnpage>indexOnpage-maxButtonnumber.current)?1:0
        let indexToScroll=(indexOnpage-maxButtonnumber.current+offset<0)?0:indexOnpage-maxButtonnumber.current+offset
        buttondivref.current!.getElementsByClassName("button")[indexToScroll].scrollIntoView({inline:"start",block:"center"})
        setIndexOnpage(indexToScroll)
        console.log(buttondivref.current!.getElementsByTagName("button")[indexToScroll])
    }
    function turnright(){
        let offset=(activeOnpage<indexOnpage+maxButtonnumber.current)?1:0
        let indexToScroll=(indexOnpage+maxButtonnumber.current-offset>=buttonNumber.current)?buttonNumber.current-1:indexOnpage+maxButtonnumber.current-offset
        buttondivref.current!.getElementsByClassName("button")[indexToScroll].scrollIntoView({inline:"start",block:"center"})
        setIndexOnpage(indexToScroll)
        console.log("indexToScroll"+indexToScroll)
    }
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
export function WeatherSVG({hourlyinfo,media="large"}:{hourlyinfo:hourlyForecast[],media:"large"|"small"
}){
    var weatherForTenDay=useSelector(selectWeatherinfo)?.daily
    var indexOnpage=useContext(indexOnPageContext)
    var divref=useRef<HTMLDivElement>(null)
    var xPositionArray:Array<number>=[0]
    var smallMediaStep=4
    var largeMediaStep=2
    var height=480 //px
    var step=(media=="small")?smallMediaStep:largeMediaStep
    var width=(media=="small")?window.innerWidth*14*0.685:window.innerWidth*14*0.712
    var pointnumber=Math.floor(hourlyinfo.length/(step))
    var interval=width/(pointnumber)
    var hourlyinfoTobeUsed:hourlyForecast[]=hourlyinfo.filter((number,index)=>{
        if(index%step==0){
            return true
        }
    })
    var heightLeftOver=height-80
    var smallestTemperture=hourlyinfo[0].temperature2m
    var highestTemperature=hourlyinfo[0].temperature2m
    for(var info of hourlyinfo){
        if(smallestTemperture>info.temperature2m){
            smallestTemperture=info.temperature2m
        }
        if(highestTemperature<info.temperature2m){
            highestTemperature=info.temperature2m
        }
    }
    var yinterval=(heightLeftOver-30)/(highestTemperature-smallestTemperture+6)
    var PathdString=""
    var i=0
    for(var info of hourlyinfo){
        if(PathdString==""){
            PathdString+=`M ${0} ${heightLeftOver} `
            PathdString+=`L ${0} ${6*yinterval+(highestTemperature-info.temperature2m)*yinterval} `            
            PathdString+="C "
            i++;
            continue
        }
        if(media=="small"){
            if(i%smallMediaStep!=2)
            PathdString+=`${(interval/4)*i} ${6*yinterval+(highestTemperature-info.temperature2m)*yinterval} `
            if(i%smallMediaStep==0){
                PathdString+="C "
            }
            i++
        }
        else{
            if(i%largeMediaStep==1){
                PathdString+=`${(interval/2)*i} ${6*yinterval+(highestTemperature-info.temperature2m)*yinterval} `
                PathdString+=`${(interval/2)*i} ${6*yinterval+(highestTemperature-info.temperature2m)*yinterval} `        }
            else if(i%largeMediaStep==0){
                PathdString+=`${(interval/2)*i} ${6*yinterval+(highestTemperature-info.temperature2m)*yinterval} `
                PathdString+=`C `
            }
            i++
        }}
    var pattern=/M\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+L\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+(C\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+)+/
    var result=PathdString.match(pattern)
    console.log(result)
    if(result!=null){
        PathdString=result[0]
        var pattern2=/(\d+(\.\d+)?)\s+\d+(\.\d+)?\s+$/
        result=pattern2.exec(PathdString)
        console.log(result)
        if(result!=null)
        PathdString+=`L ${result[1]} ${heightLeftOver} Z `
    }
    width=(pointnumber-1)*interval
    useEffect(()=>{
        divref.current?.scrollTo(xPositionArray[indexOnpage],0)
    },[indexOnpage])
    return(
        <div className='overflow-hidden m-auto' style={{width:(media=="small")?interval*6.5:interval*12.7}} ref={divref} >
            <svg height={height} width={width}>
            <g id="TempertureCurve">
                    <path d={PathdString} stroke="rgba(75, 75, 155, 0.2)" fill="url(#curveGradient)" mask="url('#opacityMask')"></path>
                </g>
                <g id='textLable'>
                    {hourlyinfoTobeUsed.map((value,index)=>{
                        var text=(index==0)?"Now":`${value.time.getHours()
                        }:00`
                        if((value.time.getHours()==0||value.time.getHours()==1)&&index!=0){
                            xPositionArray.push(interval*(index))
                        }
                        return <text x={interval*(index)} y={heightLeftOver+15}>{text}</text>
                    })}
                </g>
                <g id='LineAbovetext'>
                    <line stroke='rgba(155, 75, 155, 0.9)' x1={0} y1={heightLeftOver} x2={width} y2={heightLeftOver}></line>
                </g>
                <g id='Rainprobilityimage'>
                    {
                        hourlyinfoTobeUsed.map((value,index)=>{
                            return <image x={interval*(index)-10} y={heightLeftOver-30} href='Raininpanel.svg' ></image>
                        })
                    }
                </g>
                <g id='Rainprobility'>
                    {
                        hourlyinfoTobeUsed.map((value,index)=>{
                            return <text x={interval*(index)} y={heightLeftOver-20}>{value.precipitationProbability+"%"}</text>
                        })
                    }
                </g>
                <g id="TempertureText">
                    {hourlyinfoTobeUsed.map((value,index)=>{
                        return <text x={interval*(index)} y={6*yinterval+(highestTemperature-value.temperature2m)*yinterval-10}>{value.temperature2m.toFixed()+"C°"}</text>
                    })}
                </g>
                <defs>
                    <linearGradient id="curveGradient" y1="0%" x1="0%" y2="0%" x2="100%">
                        {hourlyinfoTobeUsed.map((value,index)=>{
                            return (<stop offset={interval*(index)/width*100+"%"} stopColor={TempertureToColor(value.temperature2m)}></stop>)
                        })}
                    </linearGradient>
                    <linearGradient id="opacityGradient" y1="0%" x1="0%" y2="100%" x2="0%">
                        {hourlyinfoTobeUsed.map((value,index)=>{
                            return <stop stopColor="#c4c4c4" stopOpacity={value.temperature2m/highestTemperature} offset={((6*yinterval+(highestTemperature-value.temperature2m)*yinterval)/187)*100+"%"} ></stop>
                        })}
                        <stop stopColor="#c4c4c4" stopOpacity="0.1" offset={"100%"}></stop>
                    </linearGradient>
                    <mask id="opacityMask">
                        <rect width={width} height={height} fill="url(#opacityGradient)"></rect>
                    </mask>
                </defs>
            </svg>
        </div>
    )
}
export default function TenDayForcastingPanel({hourlyinfo}:{hourlyinfo:hourlyForecast[]}) {
    var [index,setIndex]=useState(0)
    var [media,setMedia]=useState<"small"|"large">((window.innerWidth>=1024)?"large":"small")
    useEffect(()=>{
        window!.onresize=(e)=>{
            if(window.innerWidth>=1024&&media!="large"){
                setMedia("large")
            }
            else if(window.innerWidth<=1024&&media!="small"){
                setMedia("small")
            }
        }
    })
    return(
        <div>
            <indexOnPageContext.Provider value={index} >
            <div><ButtonPanleForTenDay onClick={setIndex}></ButtonPanleForTenDay></div>
            <div><WeatherSVGMotion hourlyinfo={hourlyinfo} /></div>
            </indexOnPageContext.Provider>
        </div>
    )   
};

