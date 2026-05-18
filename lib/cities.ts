import type { CityInfo } from "@/app/type/weatherType";

function normalizeCityInfoResponse(raw: any): CityInfo {
  if (!raw || raw.status !== "success" || !raw.value) {
    return {
      status: "error",
      message: "Invalid city lookup response",
    };
  }

  const longitude = Number(raw.value.longitude);
  const latitude = Number(raw.value.latitude);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return {
      status: "error",
      message: "Invalid coordinates from city lookup",
    };
  }

  return {
    status: "success",
    value: {
      longitude,
      latitude,
      country: raw.value.country,
      name: raw.value.name,
    },
  };
}

async function fetchFromBackend(endpoint: string): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  return response.json();
}

export async function getCityInfo(locationName: string): Promise<CityInfo> {
  const encodedName = encodeURIComponent(locationName.trim());
  const data = await fetchFromBackend(`/name/${encodedName}`);
  return normalizeCityInfoResponse(data);
}

export async function getCityInfoByCoordinates(longitude: number, latitude: number): Promise<CityInfo> {
  const data = await fetchFromBackend(`/location/${longitude}/${latitude}`);
  return normalizeCityInfoResponse(data);
}
