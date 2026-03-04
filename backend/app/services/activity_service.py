from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import current_app

from .. import db
from ..models import User, UserActivity


VALID_ACTIVITY_TYPES = {
    "APP_LOAD",
    "SEARCH",
    "NEARBY_SEARCH",
    "IDENTIFY",
    "GEOLOCATION",
}


def _get_or_create_user(user_uuid: str) -> User:
    user = User.query.filter_by(user_uuid=user_uuid).first()
    now = datetime.utcnow()
    if user is None:
        user = User(user_uuid=user_uuid, first_seen=now, last_seen=now)
        db.session.add(user)
    else:
        user.last_seen = now
    return user


def log_activity(payload: dict[str, Any]) -> UserActivity:
    user_uuid = str(payload.get("user_uuid", "")).strip()
    if not user_uuid:
        raise ValueError("user_uuid is required")

    activity_type = str(payload.get("activity_type", "")).strip().upper()
    if activity_type not in VALID_ACTIVITY_TYPES:
        raise ValueError(f"Invalid activity_type '{activity_type}'")

    _get_or_create_user(user_uuid)

    ts = payload.get("timestamp")
    if isinstance(ts, str):
        try:
            timestamp = datetime.fromisoformat(ts)
        except ValueError:
            timestamp = datetime.utcnow()
    elif isinstance(ts, datetime):
        timestamp = ts
    else:
        timestamp = datetime.utcnow()

    activity = UserActivity(
        user_uuid=user_uuid,
        activity_type=activity_type,
        parking_id=payload.get("parking_id"),
        search_query=payload.get("search_query"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        timestamp=timestamp,
    )

    db.session.add(activity)
    db.session.commit()

    if current_app.logger:
        current_app.logger.debug(
            "Logged activity",
            extra={"user_uuid": user_uuid, "activity_type": activity_type},
        )

    return activity

