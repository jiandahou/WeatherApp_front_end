import type { hourlyForecast, weatherdailyinfo, weatherinfoFetched } from "../type/weatherType";

function reviveDailyForecast(day: weatherdailyinfo): weatherdailyinfo {
  return {
    ...day,
    time: new Date(day.time),
  };
}

function reviveHourlyForecast(hour: hourlyForecast): hourlyForecast {
  return {
    ...hour,
    time: new Date(hour.time),
  };
}

function reviveWeatherDates(data: weatherinfoFetched): weatherinfoFetched {
  if (!data) return data;

  return {
    daily: {
      ...data.daily,
      time: new Date(data.daily.time),
      weatherForNextTenDay: data.daily.weatherForNextTenDay.map(reviveDailyForecast),
    },
    hourly: data.hourly.map(reviveHourlyForecast),
  };
}

export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<weatherinfoFetched> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const response = await fetch(`/api/weather?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status}`);
  }

  const data = (await response.json()) as weatherinfoFetched;
  return reviveWeatherDates(data);
}
