import { logActivity } from "../services/activityApi";
import { useGeolocation } from "../hooks/useGeolocation";

type Props = {
  userUuid: string | null;
  hasSelection: boolean;
  onRouteToSelected: (coords: { latitude: number; longitude: number }) => void;
};

export const RouteToSelectedButton = ({
  userUuid,
  hasSelection,
  onRouteToSelected
}: Props) => {
  const { requestLocation } = useGeolocation();

  const handleRoute = async () => {
    if (!userUuid || !hasSelection) return;

    const position = await requestLocation();
    if (!position) return;

    const { latitude, longitude } = position.coords;

    await logActivity({
      user_uuid: userUuid,
      activity_type: "GEOLOCATION",
      latitude,
      longitude
    }).catch(() => {});

    onRouteToSelected({ latitude, longitude });
  };

  return (
    <button
      className="nearby-button"
      type="button"
      onClick={handleRoute}
      disabled={!hasSelection}
      title={
        hasSelection
          ? "Route from your location to selected parking"
          : "Search and select a parking first"
      }
    >
      Route to Selected
    </button>
  );
};

