from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..middleware.auth import require_admin_token
from ..services.admin_service import (
    total_users,
    activity_summary,
    top_facilities,
    activity_heatmap,
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/total-users")
@require_admin_token
def get_total_users():
    return jsonify({"total_users": total_users()})


@admin_bp.get("/activity-summary")
@require_admin_token
def get_activity_summary():
    return jsonify({"activities": activity_summary()})


@admin_bp.get("/top-facilities")
@require_admin_token
def get_top_facilities():
    try:
        limit = int(request.args.get("limit", "10"))
    except ValueError:
        limit = 10
    limit = max(1, min(limit, 100))
    return jsonify({"facilities": top_facilities(limit=limit)})


@admin_bp.get("/activity-heatmap")
@require_admin_token
def get_activity_heatmap():
    return jsonify({"points": activity_heatmap()})

