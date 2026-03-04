# import os
# from pathlib import Path


# class Config:
#     """Base configuration compatible with SQLite now and PostgreSQL later."""

#     # Database
#     SQLALCHEMY_DATABASE_URI: str
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     # Admin
#     ADMIN_TOKEN: str | None

#     # GeoJSON
#     GEOJSON_PATH: str

#     # CORS
#     CORS_ORIGINS: str | list[str]

#     @classmethod
#     def from_env(cls) -> "Config":
#         instance = cls()

#         # Default to SQLite file in instance directory
#         default_db = "sqlite:///" + str(
#             Path(os.environ.get("BACKEND_INSTANCE_PATH", ".")).joinpath("app.db").resolve()
#         )
#         instance.SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", default_db)

#         instance.ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

#         # Default GeoJSON path (can be overridden by env)
#         # default_geojson = str(
#         #     Path(os.environ.get("PARKING_GEOJSON", "data/parking.geojson")).resolve()
#         # )
#         # instance.GEOJSON_PATH = default_geojson

#         # GeoJSON
#         base_dir = Path(__file__).resolve().parent.parent  # backend/
#         default_geojson = base_dir / "data" / "parking.geojson"

#         instance.GEOJSON_PATH = os.environ.get(
#             "PARKING_GEOJSON",
#             str(default_geojson)
#         )


#         cors_origins = os.environ.get("CORS_ORIGINS", "*")
#         if "," in cors_origins:
#             instance.CORS_ORIGINS = [o.strip() for o in cors_origins.split(",") if o.strip()]
#         else:
#             instance.CORS_ORIGINS = cors_origins

#         return instance

import os
from pathlib import Path


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @classmethod
    def from_env(cls) -> "Config":
        instance = cls()

        # Base directory = backend/
        base_dir = Path(__file__).resolve().parent.parent

        # Database
        default_db = "sqlite:///" + str((base_dir / "app.db").resolve())
        instance.SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", default_db)

        # Admin
        instance.ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

        # GeoJSON
        default_geojson = base_dir / "data" / "parking.geojson"
        instance.GEOJSON_PATH = os.environ.get(
            "PARKING_GEOJSON",
            str(default_geojson)
        )

        # CORS
        cors_origins = os.environ.get("CORS_ORIGINS", "*")
        if "," in cors_origins:
            instance.CORS_ORIGINS = [o.strip() for o in cors_origins.split(",") if o.strip()]
        else:
            instance.CORS_ORIGINS = cors_origins

        return instance
