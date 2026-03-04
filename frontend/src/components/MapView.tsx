import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { divIcon, type LatLngExpression } from "leaflet";
// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { logActivity } from "../services/activityApi";
import type { ParkingFeature } from "../routes/MapPage";

// const parkingIcon = icon({
//   iconUrl: "/parking-pin.svg",
//   iconSize: [45, 45],
//   iconAnchor: [16, 45],
//   popupAnchor: [0, -28]
// });

const parkingIcon = icon({
  iconUrl: "/parking-sign.png", // or .svg
  iconSize: [32, 32],          // adjust to your asset
  iconAnchor: [16, 32],        // bottom center
  popupAnchor: [0, -28]
});

type Props = {
  userUuid: string | null;
  features: ParkingFeature[];
  center: LatLngExpression;
  zoom: number;
  routeGeoJson: any | null;
  userLocation: { latitude: number; longitude: number } | null;
};

const userLocationIcon = divIcon({
  className: "user-location-icon",
  html: '<div class="user-location-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const MapViewInner: React.FC<Props> = ({
  userUuid,
  features,
  center,
  zoom,
  routeGeoJson,
  userLocation
}) => {
  const map = useMap();
  map.setView(center, zoom);

  const handleMarkerClick = (feature: ParkingFeature) => {
    if (!userUuid) return;
    logActivity({
      user_uuid: userUuid,
      activity_type: "IDENTIFY",
      parking_id: feature.properties.id
    }).catch(() => {});
  };

  const routeCoords: LatLngExpression[] =
    routeGeoJson?.features?.[0]?.geometry?.coordinates?.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    ) || [];

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {features.map((feature) => {
        const [lon, lat] = feature.geometry.coordinates;
        const props: any = feature.properties || {};
        const name = props.name || props.Name || props.NAME || props.id;
        const address = props.address || props.Address || "";
        const slots = props.slots || props.Slots || "";
        const operating_hours = props.operating_hours || "";
        return (
          <Marker
            key={feature.properties.id}
            position={[lat, lon]}
            icon={parkingIcon}
            eventHandlers={{
              click: () => handleMarkerClick(feature)
            }}
          >
            <Popup>
                <strong>{name}</strong>
              <br />
                 {address}
                <br/>
               Total Slots: {slots}
               <br/>
               Operating hours: {operating_hours}
              {feature.properties.capacity != null && (
                <>
                  <br />
                  Capacity: {feature.properties.capacity}
                </>
              )}
              {feature.properties.status && (
                <>
                  <br />
                  Status: {feature.properties.status}
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userLocationIcon}
        >
          <Popup>
            <strong>Your location</strong>
          </Popup>
        </Marker>
      )}
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} pathOptions={{ color: "#22c55e" }} />
      )}
    </>
  );
};

export const MapView: React.FC<Props> = (props) => {
  return (
    <MapContainer
      center={props.center}
      zoom={props.zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <MapViewInner {...props} />
    </MapContainer>
  );
};

