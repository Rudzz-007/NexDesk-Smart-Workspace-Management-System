from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class BookingBase(BaseModel):
    desk_id: str = Field(..., examples=["DESK-A12"])
    start_time: datetime
    end_time: datetime


class BookingCreate(BookingBase):

    @field_validator("start_time")
    @classmethod
    def validate_future_start(cls, value: datetime) -> datetime:
        """Reject bookings whose start_time has already elapsed."""
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


class BookingResponse(BookingBase):
    id: int
    user_id: int
    final_price: float
    noshow_probability: Optional[float] = None
    status: str

    class Config:
        from_attributes = True