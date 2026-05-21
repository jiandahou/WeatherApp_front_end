import type { weatherinfoFetched } from "../type/weatherType";

export type SavedCityCookie =
  | string
  | {
      name: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };

export type SavedCityRecord = Exclude<SavedCityCookie, string>;

export function normalizeSavedCityCookie(value: unknown): SavedCityCookie | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<SavedCityRecord>;
  if (typeof candidate.name !== "string" || candidate.name.trim() === "") return null;

  return {
    name: candidate.name,
    country: typeof candidate.country === "string" ? candidate.country : undefined,
    latitude: typeof candidate.latitude === "number" && Number.isFinite(candidate.latitude) ? candidate.latitude : undefined,
    longitude: typeof candidate.longitude === "number" && Number.isFinite(candidate.longitude) ? candidate.longitude : undefined,
  };
}

export function getSavedCityName(city: SavedCityCookie): string {
  return typeof city === "string" ? city : city.name;
}

export function getSavedCityCountry(city: SavedCityCookie): string | undefined {
  return typeof city === "string" ? undefined : city.country;
}

export function getSavedCityIdentity(city: SavedCityCookie): string {
  const name = getSavedCityName(city).trim().toLowerCase();
  const country = getSavedCityCountry(city)?.trim().toLowerCase();
  return country ? `${name}:${country}` : name;
}

export function createSavedCityFromWeather(weatherData: weatherinfoFetched): SavedCityRecord | null {
  if (!weatherData?.daily.location) return null;

  return {
    name: weatherData.daily.location,
    country: weatherData.daily.country,
    latitude: weatherData.daily.latitude,
    longitude: weatherData.daily.longitude,
  };
}
