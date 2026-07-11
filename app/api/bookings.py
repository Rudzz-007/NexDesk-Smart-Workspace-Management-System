from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.session import get_db
from app.models.booking import Booking  # Imported cleanly here
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.api.deps import get_current_user
from app.services.ml_predictor import predictor_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Places a workspace reservation with dynamic pricing coefficients and no-show predictive analysis."""
    
    if booking_in.start_time >= booking_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time window: start_time must occur before end_time."
        )

    # Collision boundary checking
    query = select(Booking).where(
        and_(
            Booking.desk_id == booking_in.desk_id,
            Booking.status == "confirmed",
            Booking.start_time < booking_in.end_time,
            Booking.end_time > booking_in.start_time
        )
    )
    
    result = await db.execute(query)
    conflicting_booking = result.scalar_one_or_none()
    
    if conflicting_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflict detected: {booking_in.desk_id} is already reserved during this timeframe."
        )

    # Compute live features using our ML service layer
    live_price = predictor_service.predict_dynamic_price(booking_in.start_time)
    live_noshow_prob = predictor_service.predict_noshow_probability(current_user.email, booking_in.start_time)

    new_booking = Booking(
        user_id=current_user.id,
        desk_id=booking_in.desk_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        final_price=live_price,
        noshow_probability=live_noshow_prob,
        status="confirmed"
    )

    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    return new_booking