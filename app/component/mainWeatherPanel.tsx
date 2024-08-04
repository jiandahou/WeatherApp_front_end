"use client"
import { url } from "inspector";
import { ReactNode, useEffect, useRef, useState } from "react";
import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation";
import moment from "moment";

export default function MainWeatherPanel({weatherNow}:{weatherNow:locationWeather}) {
    var [now,setNow]=useState(moment())
    let weathername=WeatherCodeInterpretator[weatherNow.weatherCode]
    useEffect(()=>{
        setInterval(()=>setNow(moment()),1000)
    })
    return(
    //Need get Image of background to the public files
    <div className="rounded-md	bg-white w-full " style={{backgroundImage:"url("+weathername+".webp"+")"}} >
        <div className="pt-4 text-center sm:text-left">
            <div className="px-4">
                <div>
                    <div className="text-lg">Weather Now</div>
                    <div className="text-base">{now.format('MMMM Do YYYY, h:mm:ss a')} </div>
                </div>
            </div>
            <div className="px-4">
                <div className="flex items-center flex-col sm:flex-row justify-between ">
                    <div className="flex items-center">
                        <img src={weathername+".svg" }  onError={(e)=>(e.currentTarget.src="sun.svg")} width={72} height={72}></img>
                        <div className="text-6xl">{weatherNow.temperatureNow.toFixed()}</div>
                        <div className="text-2xl">°C</div>
                    </div>
                    <div className="mx-5">
                        <div className=" text-lg">{weathername}</div>
                        <div className="sm:flex hidden sm:block">
                            <div>Apparent Temperature</div>
                            <img src="ApparentTemperature.png" className=" size-7"></img>
                            <div>{Math.round(weatherNow.apparentTemperatureNow)}°</div>                        </div>
                    </div>
                </div>
            </div>
            <div className="my-6">
                <p>Today Weather is {weathername}. The highest tempture is {Math.round(weatherNow.highestTemperature)}. </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-between">
                <div >
                    <div className="flex group relative">
                        <span className="group-hover:underline text-sm">SunshineDuration</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="SunshineDuration.png" width={25} height={25}></img>
                        <HiddenPanel>Sunshine duration is a climatological indicator.It is a general indicator of cloudiness of a location, and thus differs from insolation, which measures the total energy delivered by sunlight over a given period.</HiddenPanel>
                    </div>
                    <div>
                        {(weatherNow.sunshineDuration/3600).toFixed(1)} hour
                    </div>
                </div>
                <div>
                    <div className="flex group relative">
                        <span className="group-hover:underline text-sm">Wind Speed</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="Windspeed.png" width={25} height={25}></img>
                        <HiddenPanel>Wind speed can be categorized in several ways based on its characteristics and effects</HiddenPanel>
                    </div>
                    <div>
                       {weatherNow.windSpeed10m.toFixed()} kmh
                    </div>
                </div>
                <div>
                    <div className="flex group relative">
                    <span className="group-hover:underline text-sm">Snowfall</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" ><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="Snowfall.png" width={25} height={25}></img>
                        <HiddenPanel>Snowfall typically refers to the posibility of the Snowfall.</HiddenPanel>
                    </div>
                    <div>
                        {weatherNow.snowfall.toFixed(3)}%
                    </div>
                </div>
                <div>
                    <div className="flex group relative">
                        <span className="group-hover:underline text-sm">Rainsum</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" ><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="Rainsum.png" width={25} height={25}></img>
                        <HiddenPanel>Rainsum typically refers to the total amount of rainfall measured over a day.</HiddenPanel>
                    </div>
                    <div>
                        {weatherNow.rainsum.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div className="flex group relative">
                        <span className="group-hover:underline text-sm">Pressure</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" ><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="Pressure.png" width={25} height={25}></img>
                        <HiddenPanel>High-pressure systems (anticyclones) are generally associated with clear, calm weather.<br></br>
                        Low-pressure systems (cyclones) are associated with cloudy, rainy, or stormy weather.</HiddenPanel>
                    </div>
                    <div>
                        {weatherNow.pressureMsl.toFixed(0)}hPa
                    </div>
                </div>
                <div>
                    <div className="flex group relative">
                        <span className="group-hover:underline text-sm">DaylightDuration</span>
                        <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" ><path d="M6.00001 0.166061C9.22217 0.166061 11.8342 2.77814 11.8342 6.0003C11.8342 9.22246 9.22217 11.8345 6.00001 11.8345C2.77785 11.8345 0.165771 9.22246 0.165771 6.0003C0.165771 2.77814 2.77785 0.166061 6.00001 0.166061ZM6.00001 1.04106C3.2611 1.04106 1.04077 3.26139 1.04077 6.0003C1.04077 8.73921 3.2611 10.9595 6.00001 10.9595C8.73892 10.9595 10.9592 8.73921 10.9592 6.0003C10.9592 3.26139 8.73892 1.04106 6.00001 1.04106ZM5.99788 5.12473C6.21937 5.12459 6.40253 5.28906 6.43164 5.50258L6.43567 5.56195L6.43777 8.77121C6.43793 9.01284 6.24218 9.20884 6.00056 9.209C5.77907 9.20914 5.59591 9.04467 5.5668 8.83115L5.56277 8.77178L5.56067 5.56252C5.56051 5.3209 5.75626 5.12489 5.99788 5.12473ZM6.00027 3.08437C6.32201 3.08437 6.58282 3.34519 6.58282 3.66693C6.58282 3.98866 6.32201 4.24948 6.00027 4.24948C5.67854 4.24948 5.41772 3.98866 5.41772 3.66693C5.41772 3.34519 5.67854 3.08437 6.00027 3.08437Z" fill="black" fill-opacity="0.55"></path></svg></span>
                        <img src="daylight.png" width={25} height={25}></img>
                        <HiddenPanel>Daylight duration refers to the length of time each day that an area experiences natural light from the sun. This period extends from sunrise to sunset.</HiddenPanel>
                    </div>
                    <div>
                        {(weatherNow.daylightDuration/3600).toFixed(0)} hours
                    </div>
                </div>
            </div>
        </div>
    </div>)
};
export function HiddenPanel({children}:{children:ReactNode}){
    return (<div className=" transition  duration-500 group-hover:block absolute  opacity-0 group-hover:opacity-100 top-1 left-1/4 z-20 bg-slate-200  max-w-48 w-max rounded-md p-2 text-xs">{children}</div>)
}
