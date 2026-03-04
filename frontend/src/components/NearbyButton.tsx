import { fetchNearbyParking } from "../services/parkingApi";
import { logActivity } from "../services/activityApi";
import { useGeolocation } from "../hooks/useGeolocation";

type Props = {
  userUuid: string | null;
  onNearby: (coords: { latitude: number; longitude: number }) => void;
};

export const NearbyButton = ({ userUuid, onNearby }: Props) => {
  const { requestLocation } = useGeolocation();

  const handleNearby = async () => {
    if (!userUuid) return;

    // record that user allowed geolocation (if they do)
    const position = await requestLocation();
    if (!position) return;

    const { latitude, longitude } = position.coords;

    await logActivity({
      user_uuid: userUuid,
      activity_type: "GEOLOCATION",
      latitude,
      longitude
    }).catch(() => {});

    await logActivity({
      user_uuid: userUuid,
      activity_type: "NEARBY_SEARCH",
      latitude,
      longitude
    }).catch(() => {});

    // Inform parent so it can update map and route
    onNearby({ latitude, longitude });

    // Call backend nearby endpoint so search is recorded/available
    try {
      await fetchNearbyParking(latitude, longitude, 1000000);
    } catch {
      // ignore
    }
  };

  return (
    <button className="nearby-button" type="button" onClick={handleNearby}>
      Nearby Parking
    </button>
  );
};

