from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flask import current_app

_CACHE: dict[str, Any] | None = None


class GeoJSONValidationError(RuntimeError):
    pass


def _validate_feature_collection(data: dict[str, Any]) -> None:
    if data.get("type") != "FeatureCollection":
        raise GeoJSONValidationError("GeoJSON root must be a FeatureCollection")

    features = data.get("features")
    if not isinstance(features, list):
        raise GeoJSONValidationError("GeoJSON FeatureCollection must include a features list")

    for feature in features:
        if feature.get("type") != "Feature":
            raise GeoJSONValidationError("Each item in features must be a Feature")
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "Point":
            raise GeoJSONValidationError("Geometry type must be Point")
        coords = geometry.get("coordinates")
        if not isinstance(coords, (list, tuple)) or len(coords) != 2:
            raise GeoJSONValidationError("Point coordinates must be [lon, lat]")

        properties = feature.get("properties") or {}
        for key in ("id", "name", "address"):
            if key not in properties:
                raise GeoJSONValidationError(f"Feature properties must include '{key}'")


def load_parking_geojson() -> dict[str, Any]:
    """Load and cache parking GeoJSON from configured path."""
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    path = Path(current_app.config["GEOJSON_PATH"])
    if not path.exists():
        # For initial development without real data, return empty collection.
        _CACHE = {"type": "FeatureCollection", "features": []}
        return _CACHE

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    _validate_feature_collection(data)
    _CACHE = data
    return data


def reset_cache() -> None:
    global _CACHE
    _CACHE = None

