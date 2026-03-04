import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import { MapView } from "../components/MapView";
import { SearchBar } from "../components/SearchBar";
import { NearbyButton } from "../components/NearbyButton";
import { RouteToSelectedButton } from "../components/RouteToSelectedButton";
import { logActivity } from "../services/activityApi";
import { useUserUUID } from "../hooks/useUserUUID";
import { fetchParking, fetchNearbyParking } from "../services/parkingApi";
import { fetchRoute } from "../services/routingApi";
import type { LatLngExpression } from "leaflet";

export type ParkingFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: string | number;
    name: string;
    address: string;
    capacity?: number;
    status?: string;
    [key: string]: any;
  };
};

export const MapPage = () => {
  const userUuid = useUserUUID();
  const [allFeatures, setAllFeatures] = useState<ParkingFeature[]>([]);
  const [visibleFeatures, setVisibleFeatures] = useState<ParkingFeature[]>([]);
  const [center, setCenter] = useState<LatLngExpression>([8.99, 38.79]);
  const [zoom, setZoom] = useState<number>(13);
  const [routeGeoJson, setRouteGeoJson] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<ParkingFeature | null>(
    null
  );

  useEffect(() => {
    if (userUuid) {
      logActivity({ user_uuid: userUuid, activity_type: "APP_LOAD" }).catch(
        () => {}
      );
    }
  }, [userUuid]);

  useEffect(() => {
    fetchParking()
      .then((fc) => {
        const features = (fc.features || []) as ParkingFeature[];
        setAllFeatures(features);
        setVisibleFeatures(features);
      })
      .catch(() => {
        setAllFeatures([]);
        setVisibleFeatures([]);
      });
  }, []);

  const handleSearchSelect = (feature: ParkingFeature) => {
    setUserLocation(null);
    setSelectedFeature(feature);
    setVisibleFeatures([feature]);
    const [lon, lat] = feature.geometry.coordinates;
    setCenter([lat, lon]);
    setZoom(17);
    setRouteGeoJson(null);
  };

  const handleNearbyResult = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setUserLocation(coords);
    setRouteGeoJson(null);

    // use backend nearby endpoint to pick nearest facility; very large radius so it's effectively unrestricted
    const fc = await fetchNearbyParking(coords.latitude, coords.longitude, 1000000);
    const nearest = (fc.features || [])[0] as ParkingFeature | undefined;
    if (!nearest) {
      // No nearby parking, just center on user
      setCenter([coords.latitude, coords.longitude]);
      setZoom(15);
      return;
    }

    setVisibleFeatures([nearest]);

    const [destLon, destLat] = nearest.geometry.coordinates;
    setCenter([coords.latitude, coords.longitude]);
    setZoom(15);

    const route = await fetchRoute(
      coords.latitude,
      coords.longitude,
      destLat,
      destLon
    );
    if (route) {
      setRouteGeoJson(route);
    } else {
      // Fallback: straight line between user and destination
      setRouteGeoJson({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [coords.longitude, coords.latitude],
                [destLon, destLat]
              ]
            },
            properties: {}
          }
        ]
      });
    }
  };

  const handleRouteToSelected = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    if (!selectedFeature) return;

    setUserLocation(coords);
    setRouteGeoJson(null);

    const [destLon, destLat] = selectedFeature.geometry.coordinates;
    setVisibleFeatures([selectedFeature]);
    setCenter([coords.latitude, coords.longitude]);
    setZoom(15);

    const route = await fetchRoute(
      coords.latitude,
      coords.longitude,
      destLat,
      destLon
    );
    if (route) {
      setRouteGeoJson(route);
    } else {
      setRouteGeoJson({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [coords.longitude, coords.latitude],
                [destLon, destLat]
              ]
            },
            properties: {}
          }
        ]
      });
    }
  };

  return (
    <AppShell>
      <div className="map-layout">
        <div className="map-controls">
          <SearchBar
            userUuid={userUuid}
            features={allFeatures}
            onSelectFeature={handleSearchSelect}
          />
          <NearbyButton
            userUuid={userUuid}
            onNearby={handleNearbyResult}
          />
          {selectedFeature && (
            <RouteToSelectedButton
              userUuid={userUuid}
              hasSelection={true}
              onRouteToSelected={handleRouteToSelected}
            />
          )}
        </div>
        <div className="map-container">
          <MapView
            userUuid={userUuid}
            features={visibleFeatures}
            center={center}
            zoom={zoom}
            routeGeoJson={routeGeoJson}
            userLocation={userLocation}
          />
        </div>
      </div>
    </AppShell>
  );
};

