"use client"
import { useEffect, useRef, useState } from "react"
import { GetTheCityInfo, GetTheCityInfoByLola, GetWeatherForecast, ReverseGeocoding } from "./action/serveractions"
import TopBar from "./component/topBar"
import MainWeatherPanel from "./component/mainWeatherPanel"
import TenDayForcastingPanel from "./component/tenDayForcastingPanel"
import Cookies from 'js-cookie';
import Windcompass from "./component/windcompass"
import FeelsLike from "./component/FeelsLike"
import Pressure from "./component/Pressure"
import Visibility from "./component/Visibility"
import SkeletonLoader from "./skeleton/SkeletonLoader"
import { useSelector } from 'react-redux';
import { RootState,AppDispatch} from './store/store';
import {pushWeatherinfoArray, selectLocation,selectWeatherinfo,selectWeatherinfoArray,setWeatherinfo,setWeatherState,fetchAndSetInfo} from "./store/slice/weatherSlice" 
import { useDispatch } from 'react-redux';
export default function Home() {
  function getDefaultCity(): string {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) {
        return "Beijing";
    }
    if (lang.startsWith('ja')) {
        return "Tokyo";
    }
    if (lang.startsWith('fr')) {
        return "Paris";
    }
    if (lang.startsWith('es')) {
        return "Madrid";
    }
    if (lang.startsWith('de')) {
        return "Berlin";
    }
    if (lang.startsWith('ko')) {
        return "Seoul";
    }
    if (lang.startsWith('ru')) {
        return "Moscow";
    }
    if (lang.startsWith('en')) {
        return "Sydney";
    }

    return "Sydney";
}
function getCurrentPositionAsync(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }

  var weatherinfo=useSelector(selectWeatherinfo)
  var weatherinfoArray=useSelector(selectWeatherinfoArray)
  var cityName=useSelector(selectLocation)
  const dispatch = useDispatch<AppDispatch>();
  async function fetchUserLocationWeather() {
    try {
      const position = await getCurrentPositionAsync();
      const { longitude, latitude } = position.coords;
      const cityInfo = await GetTheCityInfoByLola(longitude, latitude);
      const locationName = cityInfo?.value?.name;
      if (!locationName) {
        throw new Error("No location name");
      }
      const weatherData = await GetWeatherForecast(latitude, longitude);
      weatherData.daily.location = locationName;
  
      console.log("successfully get location-based weather:", weatherData);
      dispatch(setWeatherState(weatherData));
  
    } catch (err) {
      const defaultCity = getDefaultCity();
      await dispatch(fetchAndSetInfo({ name: defaultCity, setCurrentInfo: true }));
    }
  }
useEffect(() => {
    async function loadCitiesFromCookies() {
        const cityCookie = Cookies.get("city");
        if (!cityCookie) return;
        try {
          const parsed = JSON.parse(cityCookie);
          
          if (!Array.isArray(parsed) || !parsed.every((c) => typeof c === "string" && c.trim() !== "")) {
            console.warn("Invalid cookie format, resetting...");
            Cookies.remove("city");
            return;
          }
          const allCities = parsed as string[];
          for (const city of allCities) {
            const alreadyExists = weatherinfoArray.find(
              (weatherinfo) => weatherinfo?.daily.location === city
            );
      
            if (!alreadyExists) {
              await dispatch(fetchAndSetInfo({ name: city, setCurrentInfo: false }));
            }
          }
        } catch (error) {
          console.error("Failed to parse city cookie:", error);
          Cookies.remove("city");
        }
      }
      async function init() {
        await fetchUserLocationWeather();       
        await loadCitiesFromCookies();         
      }
      init()
}, []);
const isLoading = !weatherinfo || weatherinfoArray.length === 0;
console.log(weatherinfoArray)
console.log(weatherinfo)
return (
    <div className="bg-gradient-to-b from-teal-300/70 to-blue-800/80 via-amber-200/80">
      <div className="w-4/5 mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <SkeletonLoader />
          </div>
        ) : (
          <>
            <TopBar />
            <MainWeatherPanel/>
            <div className="bg-white-transparent">
              <TenDayForcastingPanel 
                hourlyinfo={weatherinfo!.hourly} 
              />
            </div>
            <div className="grid grid-cols-12 auto-rows-fr">
              <Windcompass 
                windspeed={weatherinfo!.daily.windSpeed10m} 
                windDirection={weatherinfo!.daily.windDirection10m} 
              />
              <FeelsLike 
                apparent_temperature={weatherinfo!.daily.apparentTemperatureNow} 
                temperature={weatherinfo!.daily.temperatureNow} 
              />
              <Pressure Pressure={weatherinfo!.daily.pressureMsl} />
              <Visibility visibility={weatherinfo!.hourly[0].visibility} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
