"use client"

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { GetTheCityInfoByLola, GetWeatherForecast } from "../action/serveractions";
import { AppDispatch } from "../store/store";
import {
  fetchAndSetInfo,
  selectWeatherinfoArray,
  setWeatherState,
} from "../store/slice/weatherSlice";

function getDefaultCity(): string {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) return "Beijing";
  if (lang.startsWith("ja")) return "Tokyo";
  if (lang.startsWith("fr")) return "Paris";
  if (lang.startsWith("es")) return "Madrid";
  if (lang.startsWith("de")) return "Berlin";
  if (lang.startsWith("ko")) return "Seoul";
  if (lang.startsWith("ru")) return "Moscow";
  if (lang.startsWith("en")) return "Sydney";
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

export default function WeatherClientBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const weatherinfoArray = useSelector(selectWeatherinfoArray);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserLocationWeather() {
      try {
        const position = await getCurrentPositionAsync();
        const { longitude, latitude } = position.coords;
        const [cityInfo, weatherData] = await Promise.all([
          GetTheCityInfoByLola(longitude, latitude),
          GetWeatherForecast(latitude, longitude),
        ]);

        if (cityInfo.status !== "success" || !weatherData) {
          throw new Error("Failed to resolve user location weather");
        }

        const locationName = cityInfo.value.name;
        const country = cityInfo.value.country;
        if (!locationName) throw new Error("No location name");

        weatherData.daily.location = locationName;
        weatherData.daily.country = country;
        dispatch(setWeatherState(weatherData));
      } catch {
        const defaultCity = getDefaultCity();
        await dispatch(fetchAndSetInfo({ name: defaultCity, setCurrentInfo: true }));
      }
    }

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
          (city) => !weatherinfoArray.find((weatherinfo) => weatherinfo?.daily.location === city)
        );

        await Promise.all(
          citiesToFetch.map((city) => dispatch(fetchAndSetInfo({ name: city, setCurrentInfo: false })))
        );
      } catch {
        Cookies.remove("city");
      }
    }

    async function init() {
      const isCityRoute = /^\/weather\/[^/]+/i.test(pathname ?? "");

      // Keep SSR city stable on city routes to avoid post-hydration visual jump.
      if (isCityRoute) {
        await loadCitiesFromCookies();
        return;
      }

      await Promise.all([fetchUserLocationWeather(), loadCitiesFromCookies()]);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
