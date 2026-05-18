import { NextResponse } from 'next/server';
import { getWeatherForecast } from '@/lib/weather';

const weatherCacheControl = "s-maxage=300, stale-while-revalidate=600";

export const revalidate = 300;

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latitudeParam = searchParams.get("latitude");
  const longitudeParam = searchParams.get("longitude");
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);

  if (latitudeParam === null || longitudeParam === null) {
    return NextResponse.json({ error: "Latitude and Longitude are required" }, { status: 400 });
  }

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return NextResponse.json(
      { error: "Latitude must be between -90 and 90, and longitude must be between -180 and 180" },
      { status: 400 }
    );
  }
  
  try {
    const weatherData = await getWeatherForecast(latitude, longitude);
    return NextResponse.json(weatherData, {
      headers: {
        "Cache-Control": weatherCacheControl,
      },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
