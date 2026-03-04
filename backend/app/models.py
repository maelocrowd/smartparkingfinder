from datetime import datetime

from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    user_uuid = db.Column(db.String(64), unique=True, nullable=False, index=True)
    first_seen = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class UserActivity(db.Model):
    __tablename__ = "user_activities"

    id = db.Column(db.Integer, primary_key=True)
    user_uuid = db.Column(db.String(64), nullable=False, index=True)
    activity_type = db.Column(db.String(64), nullable=False, index=True)
    parking_id = db.Column(db.String(128), index=True)
    search_query = db.Column(db.String(256))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

