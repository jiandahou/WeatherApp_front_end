"use client"
import TopBar from "../component/topBar"
import MainWeatherPanel from "../component/mainWeatherPanel"
import TenDayForcastingPanel from "../component/tenDayForcastingPanel"
import Windcompass from "../component/windcompass"
import FeelsLike from "../component/FeelsLike"
import Pressure from "../component/Pressure"
import Visibility from "../component/Visibility"
import HumidityCard from "../component/HumidityCard"
import DewPointCard from "../component/DewPointCard"
import RainWindowCard from "../component/RainWindowCard"
import SunshineRatioCard from "../component/SunshineRatioCard"
import SkeletonLoader from "../skeleton/SkeletonLoader"
import { useSelector } from 'react-redux';
import { AlertCircle, Loader2 } from "lucide-react";
import { selectWeatherError, selectWeatherLoading, selectWeatherinfo } from "../store/slice/weatherSlice"
import WeatherClientBootstrap from "./weatherClientBootstrap";
import type { weatherinfoFetched } from "../type/weatherType";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

function WeatherStatusNotice({
  tone,
  title,
  detail,
}: {
  tone: "loading" | "warning";
  title: string;
  detail: string;
}) {
  const Icon = tone === "loading" ? Loader2 : AlertCircle;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ui-stroke-soft/20 bg-ui-surface-1/70 px-4 py-3 text-sm text-ui-text-2 shadow-panelSoft">
      <Icon className={`mt-0.5 h-4 w-4 flex-none ${tone === "loading" ? "animate-spin text-ui-accent" : "text-amber-300"}`} aria-hidden />
      <div>
        <div className="font-medium text-ui-text-1">{title}</div>
        <div className="mt-0.5 text-xs text-ui-text-3">{detail}</div>
      </div>
    </div>
  );
}

export default function Weather({
  initialSummary,
  initialWeather,
}: {
  initialSummary?: string | null;
  initialWeather: NonNullable<weatherinfoFetched>;
}) {
  const weatherinfo = useSelector(selectWeatherinfo)
  const isRefreshing = useSelector(selectWeatherLoading)
  const refreshError = useSelector(selectWeatherError)
  const pathname = usePathname();
  const activeWeather = (weatherinfo ?? initialWeather) as NonNullable<weatherinfoFetched>;
  const isLoading = !activeWeather;
  const firstHour = activeWeather?.hourly?.[0];

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const timeoutIds: number[] = [];
    const frameIds: number[] = [];
    let userInteracted = false;

    const scrollToPageTop = () => {
      if (userInteracted) return;
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      scrollingElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const markUserScrolled = () => {
      userInteracted = true;
    }

    const scheduleFrame = () => {
      const frameId = window.requestAnimationFrame(() => {
        scrollToPageTop();
      });
      frameIds.push(frameId);
    };

    const scheduleReset = (delay: number) => {
      timeoutIds.push(window.setTimeout(() => {
        scrollToPageTop();
        scheduleFrame();
      }, delay));
    };

    const scrollOnPageEvent = () => {
      scrollToPageTop();
      scheduleFrame();
    };

    scrollToPageTop();
    scheduleFrame();
    [0, 50, 150, 350, 800, 1500, 2500, 4000].forEach(scheduleReset);
    window.addEventListener("pageshow", scrollOnPageEvent);
    window.addEventListener("load", scrollOnPageEvent);
    window.addEventListener("wheel", markUserScrolled, { passive: true });
    window.addEventListener("touchmove", markUserScrolled, { passive: true });

    return () => {
      frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener("pageshow", scrollOnPageEvent);
      window.removeEventListener("load", scrollOnPageEvent);
      window.removeEventListener("wheel", markUserScrolled);
      window.removeEventListener("touchmove", markUserScrolled);
    };
  }, [pathname]);


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
            {isRefreshing ? (
              <WeatherStatusNotice
                tone="loading"
                title="Refreshing latest conditions"
                detail="Showing the current panel while the newest weather data loads."
              />
            ) : null}
            {refreshError ? (
              <WeatherStatusNotice
                tone="warning"
                title="Latest refresh did not complete"
                detail="The visible data is still available from the last successful update."
              />
            ) : null}
            <MainWeatherPanel summary={initialSummary} weatherNow={activeWeather.daily} />
            <div className="panel-surface-strong rounded-2xl border border-ui-stroke-soft/20 px-3 py-2 sm:px-4 sm:py-3">
              <TenDayForcastingPanel
                hourlyinfo={activeWeather.hourly}
                weatherForNextTenDay={activeWeather.daily.weatherForNextTenDay}
                timezone={activeWeather.daily.timezone}
                timezoneAbbreviation={activeWeather.daily.timezoneAbbreviation}
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
              {firstHour ? (
                <>
                  <Visibility visibility={firstHour.visibility} />
                  <HumidityCard humidity={firstHour.relativeHumidity2m} />
                  <DewPointCard
                    dewPoint={firstHour.dewPoint2m}
                    temperature={activeWeather.daily.temperatureNow}
                  />
                </>
              ) : (
                <div className="col-span-12 rounded-2xl border border-ui-stroke-soft/20 bg-ui-surface-1/70 p-4 text-sm text-ui-text-2 sm:col-span-6 lg:col-span-4">
                  Hourly detail is unavailable for this update.
                </div>
              )}
              <RainWindowCard
                precipitationHours={activeWeather.daily.precipitationHours}
                precipitationSum={activeWeather.daily.precipitationSum}
                precipitationProbabilityMax={activeWeather.daily.recipitationProbabilityMax}
              />
              <SunshineRatioCard
                sunshineDuration={activeWeather.daily.sunshineDuration}
                daylightDuration={activeWeather.daily.daylightDuration}
              />
            </div>
          </div>
        )}
      </>
  );
}
