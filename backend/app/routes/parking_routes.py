from __future__ import annotations

from flask import Blueprint, jsonify, request

from flask import current_app
import os

from ..services.parking_service import (
    get_all_parking,
    search_parking,
    nearby_parking,
)

parking_bp = Blueprint("parking", __name__)


@parking_bp.get("")
def list_or_search_parking():
    search = request.args.get("search")
    if search:
        data = search_parking(search)
    else:
        data = get_all_parking()
    return jsonify(data)


@parking_bp.get("/nearby")
def nearby():
    try:
        lat = float(request.args.get("lat", ""))
        lon = float(request.args.get("lon", ""))
        radius = float(request.args.get("radius", ""))
    except ValueError:
        return jsonify({"error": "lat, lon and radius must be numeric"}), 400

    if radius <= 0:
        return jsonify({"error": "radius must be positive"}), 400

    data = nearby_parking(lat=lat, lon=lon, radius_m=radius)
    return jsonify(data)



@parking_bp.route("/debug-geo")
def debug_geo():
    path = current_app.config["GEOJSON_PATH"]
    return {
        "path": path,
        "exists": os.path.exists(path)
    }