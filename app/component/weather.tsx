"use client"
import { useEffect } from "react"
import { GetTheCityInfoByLola, GetWeatherForecast } from "../action/serveractions"
import TopBar from "../component/topBar"
import MainWeatherPanel from "../component/mainWeatherPanel"
import TenDayForcastingPanel from "../component/tenDayForcastingPanel"
import Cookies from 'js-cookie';
import Windcompass from "../component/windcompass"
import FeelsLike from "../component/FeelsLike"
import Pressure from "../component/Pressure"
import Visibility from "../component/Visibility"
import SkeletonLoader from "../skeleton/SkeletonLoader"
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { selectLocation, selectWeatherinfo, selectWeatherinfoArray, setWeatherState, fetchAndSetInfo } from "../store/slice/weatherSlice"
import { useDispatch } from 'react-redux';
import Image from "next/image";
import LoginButton from "../component/loginButton"
export const dynamic = 'force-static';

export default function Weather() {
  function getDefaultCity(): string {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) return "Beijing";
    if (lang.startsWith('ja')) return "Tokyo";
    if (lang.startsWith('fr')) return "Paris";
    if (lang.startsWith('es')) return "Madrid";
    if (lang.startsWith('de')) return "Berlin";
    if (lang.startsWith('ko')) return "Seoul";
    if (lang.startsWith('ru')) return "Moscow";
    if (lang.startsWith('en')) return "Sydney";
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

  const weatherinfo = useSelector(selectWeatherinfo)
  const isLoading = !weatherinfo; 
  const weatherinfoArray = useSelector(selectWeatherinfoArray)
  const cityName = useSelector(selectLocation)
  const dispatch = useDispatch<AppDispatch>();

  async function fetchUserLocationWeather() {
    try {
      const position = await getCurrentPositionAsync();
      const { longitude, latitude } = position.coords;
      Promise.all([
        GetTheCityInfoByLola(longitude, latitude),
        GetWeatherForecast(latitude, longitude)
      ]).then(([cityInfo, weatherData]) => {
        const locationName = cityInfo?.value?.name;
        const country = cityInfo?.value?.country;
        if (!locationName) throw new Error("No location name");
        weatherData!.daily.location = locationName;
        weatherData!.daily.country = country;
        console.log("Fetched weather data for user location:", weatherData, new Date(Date.now()).toLocaleString());
        dispatch(setWeatherState(weatherData));
      });
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
      Cookies.remove("city");
      return;
    }
    const allCities = parsed as string[];
    const citiesToFetch = allCities.filter(
      (city) => !weatherinfoArray.find(
        (weatherinfo) => weatherinfo?.daily.location === city
      )
    );
    await Promise.all(
      citiesToFetch.map(city =>
        dispatch(fetchAndSetInfo({ name: city, setCurrentInfo: false }))
      )
    );

  } catch (error) {
    Cookies.remove("city");
  }
}
    async function init() {
      fetchUserLocationWeather(); // 优先
      loadCitiesFromCookies()
    }
    init();
    // eslint-disable-next-line
  }, []);


  return (
    <div className="relative min-h-screen">
      <Image
        src="/MainBackground-blur.jpg"
        alt="main-bg"
        fill
        style={{ objectFit: "cover", zIndex: 1, transition: "opacity 0.5s" }}
        priority
      />
      <div className="relative z-10 w-4/5 mx-auto">
        {isLoading ? (
          <div >
            <SkeletonLoader />
          </div>
        ) : (
          <>
            <TopBar />
            <MainWeatherPanel />
            <div className="bg-white-transparent">
              <TenDayForcastingPanel
                hourlyinfo={weatherinfo!.hourly}
              />
            </div>
            <div className="grid grid-cols-12 auto-rows-fr mt-2">
              <Windcompass />
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