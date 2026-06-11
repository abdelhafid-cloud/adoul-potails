import os
from flask import Flask, jsonify, request
from app.config import config
from app.extensions import db, migrate, jwt, mail, cors
from app.api import api


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config["default"]))

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    if app.config.get("CORS_ALLOW_ALL") or app.config["CORS_ORIGINS"] == "*":
        cors.init_app(
            app,
            resources={r"/*": {"origins": "*"}},
            allow_headers="*",
            expose_headers="*",
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
            supports_credentials=False,
            automatic_options=True,
            send_wildcard=True,
        )
    else:
        cors.init_app(
            app,
            resources={r"/*": {
                "origins": app.config["CORS_ORIGINS"],
                "allow_headers": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
            }},
            supports_credentials=True,
            automatic_options=True,
        )

    @app.after_request
    def ensure_cors_headers(response):
        """Garantit les en-têtes CORS sur toutes les réponses (y compris erreurs 4xx/5xx)."""
        if app.config.get("CORS_ALLOW_ALL") or app.config["CORS_ORIGINS"] == "*":
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
            )
        else:
            origin = request.headers.get("Origin")
            if origin and origin in app.config["CORS_ORIGINS"]:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Headers"] = "*"
                response.headers["Access-Control-Allow-Methods"] = (
                    "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
                )
                response.headers["Vary"] = "Origin"
        return response

    api.init_app(app)

    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "service": "adoul-ai-backend"}), 200

    with app.app_context():
        _seed_roles()

    return app


def _seed_roles():
    from sqlalchemy import inspect
    from app.models import Role

    if "roles" not in inspect(db.engine).get_table_names():
        return

    for role_data in Role.DEFAULT_ROLES:
        existing = Role.query.filter_by(name=role_data["name"]).first()
        if not existing:
            db.session.add(Role(**role_data))
    db.session.commit()
