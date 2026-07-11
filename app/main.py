import sys
import os
from contextlib import asynccontextmanager

# ENVIRONMENT PATH PATCH: Force Python to recognize root directory context
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.bookings import router as bookings_router
from app.api.analytics import router as analytics_router
from app.api.checkin import router as checkin_router  # Advanced Feature Import

# Lifespan verification check for ML service loading
try:
    from app.services.ml_predictor import predictor_service
    HAS_ML_SERVICE = True
except ImportError:
    HAS_ML_SERVICE = False


# LIFESPAN MANAGEMENT: Runs once during server boot/shutdown transitions
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[STARTUP] Bootstrapping NexDesk Backend Services...")
    
    if HAS_ML_SERVICE:
        print("[ML] Loading serialized Machine Learning models into memory...")
        predictor_service.load_models()
    else:
        print("💡 ML Predictor Service files not found. Skipping weight memory-mapping.")
        
    yield
    print("🛑 Shutting down NexDesk Backend Services...")


# FASTAPI APP INITIALIZATION
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.1.0",
    description="Production-grade API for workspace management, dynamic pricing, and automated check-in verification.",
    lifespan=lifespan
)


# CROSS-ORIGIN RESOURCE SHARING (CORS) MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development; restrict to trusted domain origins in production
    allow_credentials=True,
    allow_methods=["*"],  # Permits all standard verbs: GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)


# MOUNT ROUTERS
app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(analytics_router)
app.include_router(checkin_router)  # Advanced Feature Routing Mount


# APPLICATION HEALTH ENGINE
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database_engine": "PostgreSQL 18 (Asyncpg)",
        "ml_service_ready": HAS_ML_SERVICE
    }