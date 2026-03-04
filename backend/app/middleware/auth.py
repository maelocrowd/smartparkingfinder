from __future__ import annotations

from functools import wraps
from typing import Callable, TypeVar, Any

from flask import current_app, request, jsonify

F = TypeVar("F", bound=Callable[..., Any])


def require_admin_token(fn: F) -> F:
    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any):
        configured_token = current_app.config.get("ADMIN_TOKEN")
        if not configured_token:
            return (
                jsonify({"error": "Admin token not configured on server"}),
                500,
            )

        auth_header = request.headers.get("Authorization", "")
        parts = auth_header.split()
        token = parts[1] if len(parts) == 2 and parts[0].lower() == "bearer" else None

        if not token or token != configured_token:
            return jsonify({"error": "Unauthorized"}), 401

        return fn(*args, **kwargs)

    return wrapper  # type: ignore[return-value]

