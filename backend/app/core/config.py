import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "AthleticaX"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration
    # Defaulting to sqlite:///../employees.db to keep it in the backend folder
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR}/employees.db"
    )
    
    # Security configs
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-me-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    QR_SECRET: str = os.getenv("QR_SECRET", "development-only-secret-change-me")
    QR_TTL_SECONDS: int = int(os.getenv("QR_TTL_SECONDS", "30"))
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

settings = Settings()
