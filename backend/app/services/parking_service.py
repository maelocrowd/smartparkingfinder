from __future__ import annotations

import math
from typing import Any

from ..geojson_loader import load_parking_geojson


def _all_features() -> list[dict[str, Any]]:
    data = load_parking_geojson()
    return data.get("features", [])


def get_all_parking() -> dict[str, Any]:
    return {"type": "FeatureCollection", "features": list(_all_features())}


def search_parking(keyword: str) -> dict[str, Any]:
    keyword_lower = keyword.strip().lower()
    if not keyword_lower:
        return get_all_parking()

    features = []
    for feature in _all_features():
        props = feature.get("properties") or {}
        name = str(props.get("name", "")).lower()
        address = str(props.get("address", "")).lower()
        if keyword_lower in name or keyword_lower in address:
            features.append(feature)

    return {"type": "FeatureCollection", "features": features}


def _haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of Earth in meters
    R = 6371000.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def nearby_parking(lat: float, lon: float, radius_m: float) -> dict[str, Any]:
    features_in_radius: list[dict[str, Any]] = []
    for feature in _all_features():
        geometry = feature.get("geometry") or {}
        coords = geometry.get("coordinates") or [None, None]
        flon, flat = coords
        if flon is None or flat is None:
            continue

        distance = _haversine_distance_m(lat, lon, flat, flon)
        if distance <= radius_m:
            # Copy feature and augment properties with distance
            new_feature = {
                "type": feature.get("type", "Feature"),
                "geometry": geometry,
                "properties": dict(feature.get("properties") or {}),
            }
            new_feature["properties"]["distance"] = distance
            features_in_radius.append(new_feature)

    features_in_radius.sort(key=lambda f: f["properties"]["distance"])
    return {"type": "FeatureCollection", "features": features_in_radius}

