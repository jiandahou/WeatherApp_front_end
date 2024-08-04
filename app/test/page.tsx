"use client"
import { use, useEffect, useRef, useState } from "react";
import LocationNavButton from "../component/location_NavButton";
import LocationNavButtonPanel from "../component/location_NavButton_panel";
import MainWeatherPanel from "../component/mainWeatherPanel";
import ScollContainerMeun from "../component/scoll_Container_Meun";
import TenDayForcastingPanel, { Buttonforoneday, ButtonPanleForTenDay, WeatherSVG } from "../component/tenDayForcastingPanel";
import TopBar from "../component/topBar";
import WeatherLocationSearchBar from "../component/weather_Location_SearchBar";
import { GetTheCityInfo, GetWeatherForecast } from "../action/serveractions";
import Cookies from 'js-cookie';
import Windcompass from "../component/windcompass";
import FeelsLike from "../component/FeelsLike";
function isNotUndefinedArray<T>(arr: T[]): arr is Exclude<T, undefined>[] {
    return arr.every(elem => elem !== undefined);
  }  

export default function Test(){
    var latitude=useRef(0)
    var longtitude=useRef(0)
    var [isFetch,setIsFetch]=useState(false)
    var [index,setIndex]=useState(0)
    var [weatherinfo,setWeatherinfo]=useState<weatherinfoFetched>()
    var [weatherinfoArray,setweatherinfoArray]=useState<Array<weatherinfoFetched>>([])
    var Backendurl=useRef("")
    if(latitude.current!=0)
    latitude.current=Math.floor(Math.random()*90)*(Math.random()>0.5?1:-1);
    if(longtitude.current!=0)
    longtitude.current=Math.floor(Math.random()*180)*(Math.random()>0.5?1:-1)
    latitude.current=49.58703675
    longtitude.current=117.4789175
    var locationWeatherArray=weatherinfoArray.map((weatherinfo)=>{
        if(weatherinfo!=undefined)
        return weatherinfo.daliy
    })
    console.log(weatherinfo?.daliy.windDirection10m)

    useEffect(()=>{
        GetWeatherForecast(latitude.current,longtitude.current).then((r)=>{setWeatherinfo({...r,daliy:{...r.daliy,location:"Manzhouli"}});
        setIsFetch(true);
        setweatherinfoArray([...weatherinfoArray,{...r,daliy:{...r.daliy,location:"Manzhouli"}}])
        if(process.env.NEXT_PUBLIC_BACKEND_URL!=undefined){
            Backendurl.current=process.env.NEXT_PUBLIC_BACKEND_URL
        }})
        let citycookie=Cookies.get("city")
        if(citycookie!=undefined){
            let allcity= JSON.parse(citycookie) as Array<string>
            allcity.forEach((city)=>{
                if(weatherinfoArray.find((weatherinfo)=>{
                    weatherinfo?.daliy.location==city
                })==undefined){
                    GetTheCityInfo(city).then((r)=>{
                        if(r.status=="success"){
                            let longtitude=r.value.longtitude
                            let latitude=r.value.latitude 
                            GetWeatherForecast(latitude,longtitude).then
                            (r=>{
                                if(weatherinfoArray.every(((value)=>(value?.daliy.location!=city)))){
                                    setweatherinfoArray((w)=>([...w,{...r,daliy:{...r.daliy,location:city}}]));
                                }})
                        }
                    })
                }
            })
        }
    },[longtitude.current,latitude.current])
    if(weatherinfo!=undefined&&isNotUndefinedArray(locationWeatherArray)){
        return(
            <div>
            <div>{isFetch}</div>
            <h1> Test different component here</h1>
            <h1> Backendurl:{Backendurl.current}</h1>
            <WeatherLocationSearchBar/>
            <LocationNavButton weather={weatherinfo.daliy} />
            <LocationNavButtonPanel LocationInfoList={locationWeatherArray}/>
            <ScollContainerMeun LocationInfoList={locationWeatherArray}/>
            <TopBar weatherinfoArray={weatherinfoArray} setweatherinfoArray={setweatherinfoArray} setWeatherinfo={setWeatherinfo}/>
            <MainWeatherPanel weatherNow={weatherinfo.daliy}/>
            <Buttonforoneday weatherForThatDay={weatherinfo.daliy.weatherForNextTenDay[0]}/>
            <TenDayForcastingPanel weatherForTenDay={weatherinfo.daliy} hourlyinfo={weatherinfo.hourly}></TenDayForcastingPanel>
            <div className="flex w-full">
                <div className="rounded border-stone-950 border  w-full	">22</div>
                <div className="rounded border border-stone-950 ">1</div>
            </div>
            <Windcompass windspeed={20} windDirection={40}></Windcompass>
            <FeelsLike apparent_temperature={30} temperature={25}></FeelsLike>
            </div>
            
        )
    }
    else{
        return(
            <div>sorry,can not fetch the weather info here1
                            <div>{isFetch}</div>
            </div>
            
        )
    }

}