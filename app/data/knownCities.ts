export type KnownCity = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
};

export const knownCities: KnownCity[] = [
  { name: "Beijing", latitude: 39.9042, longitude: 116.4074, country: "CN" },
  { name: "Tokyo", latitude: 35.6762, longitude: 139.6503, country: "JP" },
  { name: "Paris", latitude: 48.8566, longitude: 2.3522, country: "FR" },
  { name: "Madrid", latitude: 40.4168, longitude: -3.7038, country: "ES" },
  { name: "Berlin", latitude: 52.52, longitude: 13.405, country: "DE" },
  { name: "Seoul", latitude: 37.5665, longitude: 126.978, country: "KR" },
  { name: "Moscow", latitude: 55.7558, longitude: 37.6173, country: "RU" },
  { name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "AU" },
];

export function getKnownCity(name: string): KnownCity | undefined {
  const normalizedName = name.trim().toLowerCase();
  return knownCities.find((city) => city.name.toLowerCase() === normalizedName);
}
