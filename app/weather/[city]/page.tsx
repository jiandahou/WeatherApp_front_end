import Weather from "@/app/component/weather";
import WeatherPageFrame from "@/app/component/weatherPageFrame";
import ReduxProvider from "@/app/provider/reduxProvider";
import type { Metadata } from "next";
import { getKnownCity, knownCities } from "@/app/data/knownCities";
import { getCityInfo } from "@/lib/cities";
import { getWeatherForecast } from "@/lib/weather";

// Keep city weather pages cached and regenerated every hour.
export const revalidate = 3600;

function decodeCityParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: rawCity } = await params;
  const city = decodeCityParam(rawCity);
  return {
    title: `${city} Weather – WeatherApp`,
    description: `Real-time weather forecast for ${city}: temperature, wind, precipitation, and 10-day outlook.`,
    openGraph: {
      title: `${city} Weather`,
      description: `Current conditions and 10-day forecast for ${city}.`,
    },
  };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>
  searchParams?: { __error?: string }
}) {
  const { city: rawCity } = await params
  const city = decodeCityParam(rawCity)

  // Dev-only shortcut to preview app/weather/[city]/error.tsx quickly.
  if (process.env.NODE_ENV !== 'production' && searchParams?.__error === '1') {
    throw new Error('Debug error preview for /weather/[city]');
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  let country: string | undefined;
  const knownCity = getKnownCity(city);

  if (knownCity) {
    latitude = knownCity.latitude;
    longitude = knownCity.longitude;
    country = knownCity.country;
  } else {
    try {
      const cityInfo = await getCityInfo(city);
      if (cityInfo.status === "success") {
        latitude = cityInfo.value.latitude;
        longitude = cityInfo.value.longitude;
        country = cityInfo.value.country;
      }
    } catch {
      // Fallback to open geocoding below.
    }
  }

  if (latitude === null || longitude === null) {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      { cache: "force-cache", next: { revalidate: 3600 } }
    );

    if (!geoRes.ok) {
      throw new Error(`Failed to load weather data: city lookup failed for ${city}`);
    }

    const geoData = await geoRes.json();
    const hit = geoData?.results?.[0];
    if (!hit || !Number.isFinite(hit.latitude) || !Number.isFinite(hit.longitude)) {
      throw new Error(`Failed to load weather data: no valid coordinates for ${city}`);
    }

    latitude = Number(hit.latitude);
    longitude = Number(hit.longitude);
    country = hit.country_code ?? hit.country;
  }

  const weatherInfo = await getWeatherForecast(latitude, longitude);
  if (!weatherInfo) {
    throw new Error(`Failed to fetch weather data for city: ${city}`);
  }

  weatherInfo.daily.location = city;
  weatherInfo.daily.country = country;

  // Do not block first paint on summary generation. Client fetches and updates it later.
  const weatherSummary: string | null = null;

  return (
    <WeatherPageFrame>
      <ReduxProvider params={weatherInfo}>
          <Weather initialSummary={weatherSummary} initialWeather={weatherInfo}></Weather>
      </ReduxProvider>
    </WeatherPageFrame>
  );
}

export function generateStaticParams() {
  return knownCities.map(({ name }) => ({ city: name }));
}
