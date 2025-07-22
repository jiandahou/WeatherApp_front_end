import Weather from "@/app/component/weather";
import ReduxProvider from "@/app/provider/reduxProvider";

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
  
  const response = await fetch(`${baseUrl}/name/${city}`, {
    cache: 'force-cache',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data for city: ${city}`);
  }
  
  const data = await response.json();
  const { longitude, latitude, country } = data.value;
  console.log(`${baseUrl}/api/weather/${latitude}/${longitude}`);
  const weatherData = await fetch(`${baseUrl}/weather/${latitude}/${longitude}`, {
    method: 'GET',
    next: { revalidate: 3600 },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!weatherData.ok) {
    throw new Error(`Failed to fetch weather data for city: ${city}`);
  }
  
  const weatherInfo = await weatherData.json();
  weatherInfo.daily.location = city; // Ensure the location is set correctly
  weatherInfo.daily.country = country;

  return (
    <ReduxProvider params={weatherInfo}>
        <Weather></Weather>
    </ReduxProvider>
  );
}

export function generateStaticParams() {
  return [
    { city: "Beijing" },
    { city: "Tokyo" },
    { city: "Paris" },
    { city: "Madrid" },
    { city: "Berlin" },
    { city: "Seoul" },
    { city: "Moscow" },
    { city: "Sydney" },
  ];
}
