from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.session import get_db
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.api.deps import get_current_user
from app.services.ml_predictor import predictor_service
from app.services.mailer import mailer_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ── POST /bookings/ ────────────────────────────────────────────────────────────
@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Places a workspace reservation with dynamic pricing coefficients and no-show predictive analysis."""

    if booking_in.start_time >= booking_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time window: start_time must occur before end_time.",
        )

    # Collision boundary checking
    query = select(Booking).where(
        and_(
            Booking.desk_id == booking_in.desk_id,
            Booking.status == "confirmed",
            Booking.start_time < booking_in.end_time,
            Booking.end_time > booking_in.start_time,
        )
    )

    result = await db.execute(query)
    conflicting_booking = result.scalar_one_or_none()

    if conflicting_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conflict detected: {booking_in.desk_id} is already reserved during this timeframe.",
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
        status="confirmed",
    )

    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    background_tasks.add_task(
        mailer_service.send_booking_confirmation,
        user_email=current_user.email,
        booking_id=new_booking.id,
        desk_id=new_booking.desk_id,
        start_time=new_booking.start_time,
    )
    return new_booking


# ── GET /bookings/me ───────────────────────────────────────────────────────────
# IMPORTANT: this route MUST be declared before GET /{booking_id} so FastAPI
# does not try to coerce the literal string "me" into an integer path parameter.
@router.get("/me", response_model=List[BookingResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all bookings that belong to the currently authenticated user, newest first."""
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.start_time.desc())
    )
    bookings = result.scalars().all()
    return bookings


# ── GET /bookings/{booking_id} ─────────────────────────────────────────────────
@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns full detail for a single booking. Owners see their own; admins see any."""
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking {booking_id} not found.",
        )

    # Non-admins may only view their own bookings
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you do not own this booking.",
        )

    return booking


# ── DELETE /bookings/{booking_id} ──────────────────────────────────────────────
@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancels a booking. The booking owner or any admin may cancel.
    Already-cancelled or no-show bookings are rejected to prevent state corruption."""
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking {booking_id} not found.",
        )

    # Authorisation: owner OR admin
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you do not have permission to cancel this booking.",
        )

    # Guard against re-cancelling terminal states
    terminal_statuses = {"cancelled", "no_show"}
    if booking.status in terminal_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is already in a terminal state: '{booking.status}'. No action taken.",
        )

    booking.status = "cancelled"
    await db.commit()

    return {
        "message": f"Booking {booking_id} successfully cancelled.",
        "booking_id": booking_id,
        "desk_id": booking.desk_id,
        "status": "cancelled",
    }