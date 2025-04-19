"use client"
import { useEffect, useRef, useState } from "react"
import { GetTheCityInfo, GetTheCityInfoBylola, GetWeatherForecast, ReverseGeocoding } from "./action/serveractions"
import TopBar from "./component/topBar"
import MainWeatherPanel from "./component/mainWeatherPanel"
import TenDayForcastingPanel from "./component/tenDayForcastingPanel"
import Cookies from 'js-cookie';
import Windcompass from "./component/windcompass"
import FeelsLike from "./component/FeelsLike"
import Pressure from "./component/Pressure"
import Visibility from "./component/Visibility"
export default function Home() {
  function fetchAndSetInfo(name:string,setarray:boolean=true){
    GetTheCityInfo(name).then(r=>{
      if(r.status=="success"){
        let longtitude=r.value.longitude
        let latitude=r.value.latitude 
        console.log(longtitude)
        console.log(latitude)
        GetWeatherForecast(latitude,longtitude).then
        (r=>{
            if(weatherinfoArray.every(((value)=>(value?.daliy.location!=name)))){
                setweatherinfoArray((w)=>([...w,{...r,daliy:{...r.daliy,location:name}}]));
                if(setarray==true){
                  setWeatherinfo({...r,daliy:{...r.daliy,location:name}})
                }
            }
            else{
              console.log("Already have same info for that city:" + name)
            }})
      }
      else{
        console.log(r)
      }
    })
  }
  var [weatherinfo,setWeatherinfo]=useState<weatherinfoFetched>()
  var [weatherinfoArray,setweatherinfoArray]=useState<Array<weatherinfoFetched>>([])
  useEffect(()=>{
    fetchAndSetInfo("Sydney")
  },[])
  useEffect(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
      GetTheCityInfoBylola(position.coords.longitude,position.coords.latitude).then(res=>{
        let location=res.value.name
        if(location!=undefined){
          GetWeatherForecast(position.coords.latitude,position.coords.longitude).then((r)=>{
            if(weatherinfoArray.every(((value)=>(value?.daliy.location!=location)))){
              setweatherinfoArray((w)=>([...w,{...r,daliy:{...r.daliy,location:location}}]));
              setWeatherinfo({...r,daliy:{...r.daliy,location:location}})
          }
          else{
            console.log("Already have same info for that city:" + location)
          }
          })
        }
      })
    })
  }
  else{
    console.log("cant find your information,we will set it as default")
  }},[])
  useEffect(()=>{
    let citycookie=Cookies.get("city")
    if(citycookie!=undefined){
        let allcity= JSON.parse(citycookie) as Array<string>
        allcity.forEach((city)=>{
            if(weatherinfoArray.find((weatherinfo)=>{
                weatherinfo?.daliy.location==city
            })==undefined){
              fetchAndSetInfo(city,false)
            }
        })
    }
  },[])
  if(weatherinfo!=undefined&&weatherinfoArray.length!=0)
  return (
    <div className="bg-gradient-to-b from-teal-300/70  to-blue-800/80 via-amber-200/80">
      <div className="w-4/5 mx-auto">
        <div>
        <TopBar weatherinfoArray={weatherinfoArray} setweatherinfoArray={setweatherinfoArray} setWeatherinfo={setWeatherinfo}/>
        </div>
        <MainWeatherPanel weatherNow={weatherinfo.daliy}/> 
        <div className="bg-white-transparent">
        <TenDayForcastingPanel weatherForTenDay={weatherinfo.daliy} hourlyinfo={weatherinfo.hourly}></TenDayForcastingPanel>
        </div>
        <div className="grid grid-cols-12 auto-rows-fr">
          <Windcompass windspeed={weatherinfo.daliy.windSpeed10m} windDirection={weatherinfo.daliy.windDirection10m}></Windcompass>
          <FeelsLike apparent_temperature={weatherinfo.daliy.apparentTemperatureNow} temperature={weatherinfo.daliy.temperatureNow}></FeelsLike>
          <Pressure Pressure={weatherinfo.daliy.pressureMsl}></Pressure>
          <Visibility visibility={weatherinfo.hourly[0].visibility}></Visibility>
        </div>
      </div>
    </div>
  );
  else{
    return<div>Still Rendering, maybe should put skeletion here</div>
  }
}
