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
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5433
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Krishna@770"
    DB_NAME: str = "nexdesk_db"

    BASE_DIR: str = BASE_DIR
    MODEL_DIR: str = os.path.join(BASE_DIR, "saved_models")

    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()