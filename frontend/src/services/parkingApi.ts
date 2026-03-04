import { apiGet } from "./api";

type FeatureCollection = {
  type: "FeatureCollection";
  features: any[];
};

export async function fetchParking(
  search?: string
): Promise<FeatureCollection> {
  const url = search
    ? `/api/parking?search=${encodeURIComponent(search)}`
    : "/api/parking";
  return apiGet<FeatureCollection>(url);
}

export async function fetchNearbyParking(
  lat: number,
  lon: number,
  radius: number
): Promise<FeatureCollection> {
  const url = `/api/parking/nearby?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&radius=${encodeURIComponent(radius)}`;
  return apiGet<FeatureCollection>(url);
}

