import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

type HeatPoint = {
  latitude: number;
  longitude: number;
  weight: number;
};

type Props = {
  points: HeatPoint[];
};

const HeatLayer: React.FC<Props> = ({ points }) => {
  const map = useMap();

  const layer = useMemo(() => {
    return (L as any).heatLayer([], { radius: 25, blur: 15, maxZoom: 17 });
  }, []);

  useEffect(() => {
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [layer, map]);

  useEffect(() => {
    const latLngs = points.map((p) => [p.latitude, p.longitude, p.weight]);
    layer.setLatLngs(latLngs);
  }, [points, layer]);

  return null;
};

export const ActivityHeatmap: React.FC<Props> = ({ points }) => {
  const hasPoints = points.length > 0;
  const center = hasPoints ? [points[0].latitude, points[0].longitude] : [8.99, 38.79];

  return (
    <div className="activity-heatmap">
      <h3>User Activity Heatmap</h3>
      <div className="activity-heatmap-map">
        <MapContainer
          center={center as any}
          zoom={hasPoints ? 13 : 12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatLayer points={points} />
        </MapContainer>
      </div>
    </div>
  );
};

