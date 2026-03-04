from __future__ import annotations

from typing import Any

from sqlalchemy import func

from .. import db
from ..geojson_loader import load_parking_geojson
from ..models import User, UserActivity


def total_users() -> int:
    return db.session.query(func.count(User.user_uuid.distinct())).scalar() or 0


def activity_summary() -> list[dict[str, Any]]:
    rows = (
        db.session.query(UserActivity.activity_type, func.count(UserActivity.id))
        .group_by(UserActivity.activity_type)
        .all()
    )
    return [
        {"activity_type": activity_type, "count": count} for activity_type, count in rows
    ]


def top_facilities(limit: int = 10) -> list[dict[str, Any]]:
    # Count IDENTIFY activities grouped by parking_id
    rows = (
        db.session.query(UserActivity.parking_id, func.count(UserActivity.id))
        .filter(UserActivity.activity_type == "IDENTIFY", UserActivity.parking_id.isnot(None))
        .group_by(UserActivity.parking_id)
        .order_by(func.count(UserActivity.id).desc())
        .limit(limit)
        .all()
    )

    # Build lookup from GeoJSON
    geojson = load_parking_geojson()
    feature_index: dict[str, dict[str, Any]] = {}
    for feature in geojson.get("features", []):
        props = feature.get("properties") or {}
        fid = str(props.get("id"))
        if fid:
            feature_index[fid] = props

    result: list[dict[str, Any]] = []
    for parking_id, count in rows:
        props = feature_index.get(str(parking_id), {})
        result.append(
            {
                "parking_id": parking_id,
                "name": props.get("name"),
                "address": props.get("address"),
                "identifies": count,
            }
        )

    return result


def activity_heatmap() -> list[dict[str, Any]]:
    """Return lat/lon points for activities to drive a heatmap.

    Combines:
    - Activities that already have latitude/longitude (e.g. GEOLOCATION, NEARBY_SEARCH)
    - IDENTIFY activities joined to parking GeoJSON coordinates via parking_id
    """

    points: list[dict[str, Any]] = []

    # 1) Activities that have explicit coordinates
    rows_with_coords = (
        db.session.query(UserActivity.latitude, UserActivity.longitude)
        .filter(
            UserActivity.latitude.isnot(None),
            UserActivity.longitude.isnot(None),
        )
        .all()
    )
    for lat, lon in rows_with_coords:
        points.append({"latitude": lat, "longitude": lon, "weight": 1.0})

    # 2) IDENTIFY activities mapped to parking feature centroids
    geojson = load_parking_geojson()
    feature_index: dict[str, dict[str, Any]] = {}
    for feature in geojson.get("features", []):
        props = feature.get("properties") or {}
        fid = str(props.get("id"))
        if not fid:
            continue
        geometry = feature.get("geometry") or {}
        coords = geometry.get("coordinates") or [None, None]
        lon, lat = coords
        if lon is None or lat is None:
            continue
        feature_index[fid] = {"lat": lat, "lon": lon}

    identify_rows = (
        db.session.query(UserActivity.parking_id)
        .filter(
            UserActivity.activity_type == "IDENTIFY",
            UserActivity.parking_id.isnot(None),
        )
        .all()
    )
    for parking_id, in identify_rows:
        loc = feature_index.get(str(parking_id))
        if not loc:
            continue
        points.append(
            {"latitude": loc["lat"], "longitude": loc["lon"], "weight": 1.0}
        )

    return points

