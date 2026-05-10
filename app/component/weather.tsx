"use client"
import TopBar from "../component/topBar"
import MainWeatherPanel from "../component/mainWeatherPanel"
import TenDayForcastingPanel from "../component/tenDayForcastingPanel"
import Windcompass from "../component/windcompass"
import FeelsLike from "../component/FeelsLike"
import Pressure from "../component/Pressure"
import Visibility from "../component/Visibility"
import SkeletonLoader from "../skeleton/SkeletonLoader"
import { useSelector } from 'react-redux';
import { selectWeatherinfo } from "../store/slice/weatherSlice"
import WeatherClientBootstrap from "./weatherClientBootstrap";
import type { weatherinfoFetched } from "../type/weatherType";

export default function Weather({
  initialSummary,
  initialWeather,
}: {
  initialSummary?: string | null;
  initialWeather: NonNullable<weatherinfoFetched>;
}) {
  const weatherinfo = useSelector(selectWeatherinfo)
  const activeWeather = (weatherinfo ?? initialWeather) as NonNullable<weatherinfoFetched>;
  const isLoading = !activeWeather;


  return (
      <>
        <WeatherClientBootstrap />
        {isLoading ? (
          <div>
            <SkeletonLoader />
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            <TopBar />
            <MainWeatherPanel summary={initialSummary} weatherNow={activeWeather.daily} />
            <div className="panel-surface-strong rounded-2xl border border-ui-stroke-soft/20 px-3 py-2 sm:px-4 sm:py-3">
              <TenDayForcastingPanel
                hourlyinfo={activeWeather.hourly}
                weatherForNextTenDay={activeWeather.daily.weatherForNextTenDay}
              />
            </div>
            <div className="grid grid-cols-12 auto-rows-fr gap-3 sm:gap-4">
              <Windcompass
                windspeed={activeWeather.daily.windSpeed10m}
                windDirection={activeWeather.daily.windDirection10m}
              />
              <FeelsLike
                apparent_temperature={activeWeather.daily.apparentTemperatureNow}
                temperature={activeWeather.daily.temperatureNow}
              />
              <Pressure Pressure={activeWeather.daily.pressureMsl} />
              <Visibility visibility={activeWeather.hourly[0].visibility} />
            </div>
          </div>
        )}
      </>
  );
}