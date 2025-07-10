import { useEffect } from "react";
import { GetTheCityInfoByLola, GetWeatherForecast } from "../action/serveractions";
import { fetchAndSetInfo, selectLocation, selectWeatherinfo, selectWeatherinfoArray, setWeatherState } from "../store/slice/weatherSlice";
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";

export default function WeatherClientSide() {
    const weatherinfo = useSelector(selectWeatherinfo)
    const isLoading = !weatherinfo; 
    const weatherinfoArray = useSelector(selectWeatherinfoArray)
    const cityName = useSelector(selectLocation)
    const dispatch = useDispatch<AppDispatch>();
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
  async function fetchUserLocationWeather() {
    try {
      const position = await getCurrentPositionAsync();
      const { longitude, latitude } = position.coords;
      Promise.all([
        GetTheCityInfoByLola(longitude, latitude),
        GetWeatherForecast(latitude, longitude)
      ]).then(([cityInfo, weatherData]) => {
        const locationName = cityInfo?.value?.name;
        if (!locationName) throw new Error("No location name");
        weatherData!.daily.location = locationName;
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
    <div>
      {/* Render client-side weather components here */}
    </div>
  );
}

