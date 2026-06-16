import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()


def normalize_database_url(url: str) -> str:
    """Use psycopg3 driver (better Windows/Python 3.14 support)."""
    if url.startswith("postgresql+psycopg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.getenv(
            "DATABASE_URL",
            "postgresql://adoul:adoul_secret@localhost:5432/adoul_ai",
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    FLOWISE_API_URL = os.getenv("FLOWISE_API_URL", "http://localhost:3000").rstrip("/")
    FLOWISE_CHATFLOW_ID = os.getenv("FLOWISE_CHATFLOW_ID", "")
    FLOWISE_API_KEY = os.getenv("FLOWISE_API_KEY", "")
    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "adoul_knowledge")

    MAIL_SERVER = os.getenv("SMTP_HOST", "localhost")
    MAIL_PORT = int(os.getenv("SMTP_PORT", 587))
    MAIL_USERNAME = os.getenv("SMTP_USER")
    MAIL_PASSWORD = os.getenv("SMTP_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_FROM", "noreply@adoul-ai.ma")
    MAIL_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3001")
    API_PUBLIC_URL = os.getenv("API_PUBLIC_URL", "http://localhost:5001").rstrip("/")
    DEFAULT_LOCALE = os.getenv("DEFAULT_LOCALE", "fr")

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}

    _cors_origins = os.getenv("CORS_ORIGINS", "*")
    if _cors_origins.strip() == "*":
        CORS_ORIGINS = "*"
        CORS_ALLOW_ALL = True
    else:
        CORS_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()]
        CORS_ALLOW_ALL = os.getenv("CORS_ALLOW_ALL", "false").lower() in ("1", "true", "yes")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.getenv(
            "DATABASE_URL", "postgresql://adoul:test@localhost:5432/adoul_test"
        )
    )


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
