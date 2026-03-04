# # import os
# # from flask import Flask
# # from flask_sqlalchemy import SQLAlchemy
# # from flask_cors import CORS
# # from dotenv import load_dotenv

# # from .config import Config

# # db = SQLAlchemy()


# # def create_app(config_class: type[Config] | None = None) -> Flask:
# #     # Load environment variables from .env if present
# #     load_dotenv()

# #     app = Flask(__name__)

# #     config_obj = config_class or Config.from_env()
# #     app.config.from_object(config_obj)

# #     CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

# #     db.init_app(app)

# #     # Lazy imports to avoid circular dependencies
# #     from .routes.parking_routes import parking_bp
# #     from .routes.activity_routes import activity_bp
# #     from .routes.admin_routes import admin_bp

# #     app.register_blueprint(parking_bp, url_prefix="/api/parking")
# #     app.register_blueprint(activity_bp, url_prefix="/api")
# #     app.register_blueprint(admin_bp, url_prefix="/api/admin")

# #     return app

# import os
# import logging
# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS

# from .config import Config

# db = SQLAlchemy()

# def create_app(config_class: type[Config] | None = None) -> Flask:
#     """
#     Factory function to create the Flask app.
#     """

#     # Logging
#     logging.basicConfig(level=logging.INFO)
#     logger = logging.getLogger(__name__)
#     logger.info("Starting Flask app")

#     app = Flask(__name__)

#     # Load configuration
#     config_obj = config_class or Config.from_env()
#     app.config.from_object(config_obj)

#     # CORS
#     cors_origins = app.config.get("CORS_ORIGINS", "*")
#     if isinstance(cors_origins, str):
#         cors_origins = [cors_origins]
#     CORS(app, resources={r"/api/*": {"origins": cors_origins}})
#     logger.info(f"CORS allowed origins: {cors_origins}")

#     # Initialize DB and create tables if missing to avoid "no such table" errors on first run
#     db.init_app(app)

#     # --- Auto-create tables if missing ---
#     with app.app_context():
#         db.create_all()  # creates only missing tables
# # -----------------------------------

#     # --- Auto-create tables if missing ---
#     with app.app_context():
#         engine = db.get_engine(app)
#         inspector = db.inspect(engine)
#         tables = inspector.get_table_names()

#         if "users" not in tables or "user_activities" not in tables:
#             logger.info("Creating missing tables...")
#             db.create_all()
#             logger.info("Tables created successfully")
#         else:
#             logger.info("All tables already exist, skipping creation")
#     # -----------------------------------

#     # Lazy imports to avoid circular dependencies
#     from .routes.parking_routes import parking_bp
#     from .routes.activity_routes import activity_bp
#     from .routes.admin_routes import admin_bp

#     # Register blueprints
#     app.register_blueprint(parking_bp, url_prefix="/api/parking")
#     app.register_blueprint(activity_bp, url_prefix="/api")
#     app.register_blueprint(admin_bp, url_prefix="/api/admin")

#     logger.info("Blueprints registered")

#     return app
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

from .config import Config

db = SQLAlchemy()


def create_app(config_class: type[Config] | None = None) -> Flask:
    # Load environment variables from .env if present
    load_dotenv()

    app = Flask(__name__)

    # Load config from class or environment
    config_obj = config_class or Config.from_env()
    app.config.from_object(config_obj)

    # Setup CORS
    cors_origins = app.config.get("CORS_ORIGINS", "*")
    if isinstance(cors_origins, str) and cors_origins == "*":
        cors_origins = ["*"]
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})
    app.logger.info(f"CORS allowed origins: {cors_origins}")

    # Initialize database
    db.init_app(app)

    # Lazy imports to avoid circular dependencies
    from .routes.parking_routes import parking_bp
    from .routes.activity_routes import activity_bp
    from .routes.admin_routes import admin_bp

    # Register blueprints
    app.register_blueprint(parking_bp, url_prefix="/api/parking")
    app.register_blueprint(activity_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Auto-create tables if they don't exist
    with app.app_context():
        db.create_all()
        app.logger.info("Database tables ensured/created.")

    return app