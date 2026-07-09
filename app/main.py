import sys
import os
from contextlib import asynccontextmanager

# 1. ENVIRONMENT PATH PATCH: Force Python to recognize root directory context
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router

# Placeholder for ML service loading on Day 4
try:
    from app.services.ml_predictor import predictor_service
    HAS_ML_SERVICE = True
except ImportError:
    HAS_ML_SERVICE = False


# 2. LIFESPAN MANAGEMENT: Executed exactly once when the server boots up
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Bootstrapping NexDesk Backend Services...")
    
    if HAS_ML_SERVICE:
        print("🧠 Loading serialized Machine Learning models into memory...")
        predictor_service.load_models()
    else:
        print("💡 ML Predictor Service files not created yet. Skipping model memory-mapping.")
        
    yield
    print("🛑 Shutting down NexDesk Backend Services...")


# 3. FASTAPI APP INITIALIZATION
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Production-grade API for workspace management, dynamic pricing, and no-show optimization.",
    lifespan=lifespan
)


# 4. CROSS-ORIGIN RESOURCE SHARING (CORS) MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during local dev; tighten in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)


# 5. INCLUDE ROUTERS
app.include_router(auth_router)


# 6. CORE APPLICATION HEALTH CHECK ROUTE
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database_engine": "PostgreSQL 18 (Asyncpg)",
        "ml_service_ready": HAS_ML_SERVICE
    }