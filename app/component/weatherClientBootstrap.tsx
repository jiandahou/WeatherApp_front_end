"use client"

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { GetTheCityInfoByLola } from "../action/serveractions";
import { getKnownCity } from "../data/knownCities";
import { fetchWeatherByCoordinates } from "../utils/weatherApiClient";
import { AppDispatch } from "../store/store";
import {
  fetchAndSetInfo,
  selectWeatherinfoArray,
  setWeatherState,
} from "../store/slice/weatherSlice";
import {
  getSavedCityCountry,
  getSavedCityName,
  normalizeSavedCityCookie,
  type SavedCityCookie,
} from "../utils/savedCities";

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

function getCityFromWeatherPath(pathname: string | null): string | null {
  const match = pathname?.match(/^\/weather\/([^/]+)/i);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
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
          fetchWeatherByCoordinates(latitude, longitude),
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
        const knownCity = getKnownCity(defaultCity);
        await dispatch(fetchAndSetInfo({
          name: defaultCity,
          setCurrentInfo: true,
          latitude: knownCity?.latitude,
          longitude: knownCity?.longitude,
          country: knownCity?.country,
        }));
      }
    }

    async function loadCitiesFromCookies() {
      const cityCookie = Cookies.get("city");
      if (!cityCookie) return;
      try {
        const parsed = JSON.parse(cityCookie);
        if (!Array.isArray(parsed)) {
          Cookies.remove("city");
          return;
        }

        const allCities = parsed.map(normalizeSavedCityCookie).filter((city): city is SavedCityCookie => !!city);
        const citiesToFetch = allCities.filter(
          (city) => {
            const name = getSavedCityName(city);
            const country = getSavedCityCountry(city);
            return !weatherinfoArray.find((weatherinfo) => {
              const sameName = weatherinfo?.daily.location === name;
              const sameCountry = country ? weatherinfo?.daily.country === country : true;
              return sameName && sameCountry;
            });
          }
        );

        await Promise.all(
          citiesToFetch.map((city) => {
            const name = getSavedCityName(city);
            const knownCity = getKnownCity(name);
            const latitude = typeof city === "string" ? knownCity?.latitude : city.latitude ?? knownCity?.latitude;
            const longitude = typeof city === "string" ? knownCity?.longitude : city.longitude ?? knownCity?.longitude;
            const country = getSavedCityCountry(city) ?? knownCity?.country;
            return dispatch(fetchAndSetInfo({ name, setCurrentInfo: false, latitude, longitude, country }));
          })
        );
      } catch {
        Cookies.remove("city");
      }
    }

    async function refreshCurrentRouteCity() {
      const city = getCityFromWeatherPath(pathname ?? null);
      if (!city) return;
      const knownCity = getKnownCity(city);
      await dispatch(fetchAndSetInfo({
        name: city,
        setCurrentInfo: true,
        latitude: knownCity?.latitude,
        longitude: knownCity?.longitude,
        country: knownCity?.country,
      }));
    }

    async function init() {
      const isCityRoute = /^\/weather\/[^/]+/i.test(pathname ?? "");

      // Keep SSR city visible immediately, then refresh it through the public weather API.
      if (isCityRoute) {
        await Promise.all([refreshCurrentRouteCity(), loadCitiesFromCookies()]);
        return;
      }

      await Promise.all([fetchUserLocationWeather(), loadCitiesFromCookies()]);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
