from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..services.activity_service import log_activity

activity_bp = Blueprint("activity", __name__)


@activity_bp.post("/activity")
def create_activity():
    payload = request.get_json(silent=True) or {}
    try:
        activity = log_activity(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return (
        jsonify(
            {
                "id": activity.id,
                "user_uuid": activity.user_uuid,
                "activity_type": activity.activity_type,
                "parking_id": activity.parking_id,
                "search_query": activity.search_query,
                "latitude": activity.latitude,
                "longitude": activity.longitude,
                "timestamp": activity.timestamp.isoformat(),
            }
        ),
        201,
    )

