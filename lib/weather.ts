import { fetchWeatherApi } from "openmeteo";
import type {
  hourlyForecast,
  locationWeather,
  weatherdailyinfo,
  weatherinfoFetched,
} from "@/app/type/weatherType";

const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";
const pastDays = 7;
const forecastDays = 14;

function range(start: number, stop: number, step: number) {
  return Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<weatherinfoFetched> {
  const params = {
    latitude,
    longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "pressure_msl",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
    ],
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "rain",
      "weather_code",
      "visibility",
      "wind_speed_10m",
      "wind_direction_10m",
      "soil_temperature_0cm",
      "soil_moisture_0_to_1cm",
    ],
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "sunrise",
      "sunset",
      "daylight_duration",
      "sunshine_duration",
      "precipitation_sum",
      "rain_sum",
      "showers_sum",
      "snowfall_sum",
      "precipitation_hours",
      "precipitation_probability_max",
    ],
    timezone: "auto",
    past_days: pastDays,
    forecast_days: forecastDays,
  };

  const responses = await fetchWeatherApi(weatherApiUrl, params);
  const response = responses[0];
  const utcOffsetSeconds = 0;
  const timezone = response.timezone() ?? undefined;
  const timezoneAbbreviation = response.timezoneAbbreviation() ?? undefined;

  const current = response.current()!;
  const hourly = response.hourly()!;
  const daily = response.daily()!;

  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: current.variables(0)!.value(),
      relativeHumidity2m: current.variables(1)!.value(),
      apparentTemperature: current.variables(2)!.value(),
      isDay: current.variables(3)!.value(),
      precipitation: current.variables(4)!.value(),
      rain: current.variables(5)!.value(),
      showers: current.variables(6)!.value(),
      snowfall: current.variables(7)!.value(),
      weatherCode: current.variables(8)!.value(),
      pressureMsl: current.variables(9)!.value(),
      surfacePressure: current.variables(10)!.value(),
      windSpeed10m: current.variables(11)!.value(),
      windDirection10m: current.variables(12)!.value(),
    },
    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
      dewPoint2m: hourly.variables(2)!.valuesArray()!,
      apparentTemperature: hourly.variables(3)!.valuesArray()!,
      precipitationProbability: hourly.variables(4)!.valuesArray()!,
      precipitation: hourly.variables(5)!.valuesArray()!,
      rain: hourly.variables(6)!.valuesArray()!,
      weatherCode: hourly.variables(7)!.valuesArray()!,
      visibility: hourly.variables(8)!.valuesArray()!,
      windSpeed10m: hourly.variables(9)!.valuesArray()!,
      windDirection10m: hourly.variables(10)!.valuesArray()!,
      soilTemperature0cm: hourly.variables(11)!.valuesArray()!,
      soilMoisture0To1cm: hourly.variables(12)!.valuesArray()!,
    },
    daily: {
      time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      weatherCode: daily.variables(0)!.valuesArray()!,
      temperature2mMax: daily.variables(1)!.valuesArray()!,
      temperature2mMin: daily.variables(2)!.valuesArray()!,
      apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
      apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
      daylightDuration: daily.variables(7)!.valuesArray()!,
      sunshineDuration: daily.variables(8)!.valuesArray()!,
      precipitationSum: daily.variables(9)!.valuesArray()!,
      rainSum: daily.variables(10)!.valuesArray()!,
      showersSum: daily.variables(11)!.valuesArray()!,
      snowfallSum: daily.variables(12)!.valuesArray()!,
      precipitationHours: daily.variables(13)!.valuesArray()!,
      precipitationProbabilityMax: daily.variables(14)!.valuesArray()!,
    },
  };

  const todayIndex = pastDays;
  const weatherInfoToday: locationWeather = {
    time: weatherData.current.time,
    temperatureNow: weatherData.current.temperature2m,
    apparentTemperatureNow: weatherData.current.apparentTemperature,
    isDay: weatherData.current.isDay,
    precipitation: weatherData.current.precipitation,
    rain: weatherData.current.rain,
    showers: weatherData.current.showers,
    snowfall: weatherData.current.snowfall,
    weatherCode: weatherData.current.weatherCode,
    pressureMsl: weatherData.current.pressureMsl,
    surfacePressure: weatherData.current.surfacePressure,
    windSpeed10m: weatherData.current.windSpeed10m,
    windDirection10m: weatherData.current.windDirection10m,
    highestTemperature: weatherData.daily.temperature2mMax[todayIndex],
    lowestTemperature: weatherData.daily.temperature2mMin[todayIndex],
    highestApparentTemperature: weatherData.daily.apparentTemperatureMax[todayIndex],
    daylightDuration: weatherData.daily.daylightDuration[todayIndex],
    sunshineDuration: weatherData.daily.sunshineDuration[todayIndex],
    precipitationSum: weatherData.daily.precipitationSum[todayIndex],
    rainsum: weatherData.daily.rainSum[todayIndex],
    showersSum: weatherData.daily.showersSum[todayIndex],
    snowfallSum: weatherData.daily.snowfallSum[todayIndex],
    precipitationHours: weatherData.daily.precipitationHours[todayIndex],
    recipitationProbabilityMax: weatherData.daily.precipitationProbabilityMax[todayIndex],
    weatherForNextTenDay: [] as Array<weatherdailyinfo>,
    latitude,
    longitude,
    timezone,
    timezoneAbbreviation,
  };

  for (let i = todayIndex; i < weatherData.daily.time.length; i++) {
    const dailyTime = weatherData.daily.time[i];
    weatherInfoToday.weatherForNextTenDay.push({
      highestTemperature: weatherData.daily.temperature2mMax[i],
      lowestTemperature: weatherData.daily.temperature2mMin[i],
      highestApparentTemperature: weatherData.daily.apparentTemperatureMax[i],
      daylightDuration: weatherData.daily.daylightDuration[i],
      sunshineDuration: weatherData.daily.sunshineDuration[i],
      precipitationSum: weatherData.daily.precipitationSum[i],
      rainsum: weatherData.daily.rainSum[i],
      showersSum: weatherData.daily.showersSum[i],
      snowfallSum: weatherData.daily.snowfallSum[i],
      precipitationHours: weatherData.daily.precipitationHours[i],
      recipitationProbabilityMax: weatherData.daily.precipitationProbabilityMax[i],
      time: dailyTime,
      weathercode: weatherData.daily.weatherCode[i],
    });
  }

  const hourlyForecastInfo: Array<hourlyForecast> = [];
  const todayHourlyStartIndex = todayIndex * 24;
  for (let i = todayHourlyStartIndex; i < weatherData.hourly.time.length; i++) {
    const hourlyTime = weatherData.hourly.time[i];
    hourlyForecastInfo.push({
      time: hourlyTime,
      temperature2m: weatherData.hourly.temperature2m[i],
      relativeHumidity2m: weatherData.hourly.relativeHumidity2m[i],
      dewPoint2m: weatherData.hourly.dewPoint2m[i],
      apparentTemperature: weatherData.hourly.apparentTemperature[i],
      precipitationProbability: weatherData.hourly.precipitationProbability[i],
      precipitation: weatherData.hourly.precipitation[i],
      rain: weatherData.hourly.rain[i],
      weatherCode: weatherData.hourly.weatherCode[i],
      visibility: weatherData.hourly.visibility[i],
      windSpeed10m: weatherData.hourly.windSpeed10m[i],
      windDirection10m: weatherData.hourly.windDirection10m[i],
      soilTemperature0cm: weatherData.hourly.soilTemperature0cm[i],
      soilMoisture0To1cm: weatherData.hourly.soilMoisture0To1cm[i],
    });
  }

  return {
    daily: weatherInfoToday,
    hourly: hourlyForecastInfo,
  } as weatherinfoFetched;
}
