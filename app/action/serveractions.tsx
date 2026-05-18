"use server";

import type { locationWeather, weatherinfoFetched, CityInfo } from "../type/weatherType";
import { getCityInfo, getCityInfoByCoordinates } from "@/lib/cities";
import { getWeatherForecast } from "@/lib/weather";
import { getWeatherSummary } from "@/lib/weatherSummary";

export async function GetWeatherSummary(weatherInfo: locationWeather): Promise<string | null> {
  return getWeatherSummary(weatherInfo);
}

export async function GetWeatherForecast(latitude: number, longitude: number): Promise<weatherinfoFetched> {
  return getWeatherForecast(latitude, longitude);
}

export async function GetTheCityInfo(locationName: string): Promise<CityInfo> {
  return getCityInfo(locationName);
}

export async function GetTheCityInfoByLola(longitude: number, latitude: number): Promise<CityInfo> {
  return getCityInfoByCoordinates(longitude, latitude);
}
