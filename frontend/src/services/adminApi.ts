import { apiGet } from "./api";

export async function fetchTotalUsers(token: string) {
  return apiGet<{ total_users: number }>("/api/admin/total-users", token);
}

export async function fetchActivitySummary(token: string) {
  return apiGet<{ activities: { activity_type: string; count: number }[] }>(
    "/api/admin/activity-summary",
    token
  );
}

export async function fetchTopFacilities(token: string) {
  return apiGet<{ facilities: any[] }>("/api/admin/top-facilities", token);
}

export async function fetchActivityHeatmap(token: string) {
  return apiGet<{ points: { latitude: number; longitude: number; weight: number }[] }>(
    "/api/admin/activity-heatmap",
    token
  );
}

