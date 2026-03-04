import { apiPost } from "./api";

type ActivityPayload = {
  user_uuid: string;
  activity_type: string;
  parking_id?: string | number;
  search_query?: string;
  latitude?: number;
  longitude?: number;
};

export async function logActivity(
  payload: ActivityPayload
): Promise<void> {
  await apiPost("/api/activity", payload);
}

