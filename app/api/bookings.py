import sys
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import get_db
from app.models.booking import Booking
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ml_predictor import predictor_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ── Inline Pydantic Schemas with Hardened Validators ────────────────────────

class BookingCreate(BaseModel):
    desk_id: str = Field(..., examples=["DESK-A12"])
    start_time: datetime
    end_time: datetime

    @field_validator("start_time")
    @classmethod
    def validate_future_start(cls, value: datetime) -> datetime:
        """Reject bookings whose start_time has already elapsed."""
        # Standardize timezone-aware or naive comparisons to local context
        now = datetime.now(value.tzinfo)
        if value < now:
            raise ValueError("Booking start time cannot be set in the past.")
        return value

    @field_validator("end_time")
    @classmethod
    def validate_duration_limits(cls, value: datetime, info) -> datetime:
        """Enforce 30-minute minimum and 12-hour maximum duration limits."""
        start_time = info.data.get("start_time")
        if not start_time:
            return value

        if value <= start_time:
            raise ValueError("End time must occur after the start time.")

        duration_minutes = (value - start_time).total_seconds() / 60

        if duration_minutes < 30:
            raise ValueError("Minimum booking duration must be at least 30 minutes.")
        if duration_minutes > 720:  # 12 Hours
            raise ValueError("Maximum booking duration cannot exceed 12 hours.")

        return value


class BookingResponse(BaseModel):
    id: int
    user_id: int
    desk_id: str
    start_time: datetime
    end_time: datetime
    final_price: float
    noshow_probability: Optional[float] = None
    status: str

    class Config:
        from_attributes = True


# ── POST /bookings/ ──────────────────────────────────────────────────────────

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a new desk reservation record.

    - Validates the booking window is in the future (≥ 30 min, ≤ 12 hrs).
    - Computes dynamic pricing via the ML Predictor Service.
    - Calculates a no-show probability score.
    - Persists the booking into PostgreSQL and returns the full record.
    """
    # ML predictions — price & risk score
    final_price = predictor_service.predict_dynamic_price(payload.start_time)
    noshow_prob = predictor_service.predict_noshow_probability(
        current_user.email, payload.start_time
    )

    new_booking = Booking(
        user_id=current_user.id,
        desk_id=payload.desk_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        final_price=final_price,
        noshow_probability=noshow_prob,
        status="confirmed",
    )

    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)

    return new_booking