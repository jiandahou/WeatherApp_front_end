"use server"
import { NextResponse } from 'next/server';
import { GetWeatherForecast } from '@/app/action/serveractions'
export async function GET(req: Request) {
  const { latitude, longitude } = await req.json();
  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Latitude and Longitude are required" }, { status: 400 });
  }
  
  try {
    const weatherData = await GetWeatherForecast(latitude, longitude);
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
