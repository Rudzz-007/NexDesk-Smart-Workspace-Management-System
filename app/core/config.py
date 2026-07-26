import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
ENV_PATH = os.path.join(BASE_DIR, ".env")

if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexDesk – Smart Workspace Management System"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_JWT_KEY_HERE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # PostgreSQL 18 Local Machine Connection Fallbacks
    DATABASE_URL: str | None = None
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Krishna@770"
    DB_NAME: str = "nexdesk_db"

    BASE_DIR: str = BASE_DIR
    MODEL_DIR: str = os.path.join(BASE_DIR, "saved_models")
    
    CORS_ORIGINS: str = "*"
    GOOGLE_CLIENT_ID: str | None = None

    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()

is_production = bool(settings.DATABASE_URL or os.environ.get("RENDER"))

if settings.SECRET_KEY == "YOUR_SUPER_SECRET_JWT_KEY_HERE":
    if is_production:
        raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY is using the local fallback in a production environment! Set the SECRET_KEY environment variable.")
    else:
        import warnings
        warnings.warn("WARNING: Running with default SECRET_KEY. This is unsafe for production.")

if settings.CORS_ORIGINS == "*":
    if is_production:
        raise ValueError("CRITICAL MISCONFIGURATION: CORS_ORIGINS is set to '*' in a production environment! Set the CORS_ORIGINS environment variable.")
    else:
        import warnings
        warnings.warn("WARNING: Running with wildcard CORS origins. This is unsafe for production.")