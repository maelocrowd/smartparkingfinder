type RouteGeoJSON = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: { type: "LineString"; coordinates: [number, number][] };
    properties: any;
  }[];
};

export async function fetchRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteGeoJSON | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  if (!data.routes || !data.routes[0]?.geometry) {
    return null;
  }

  const geometry = data.routes[0].geometry;

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry,
        properties: {}
      }
    ]
  };
}

