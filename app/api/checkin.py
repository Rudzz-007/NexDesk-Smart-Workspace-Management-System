import uuid
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.booking import Booking
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/checkin", tags=["Check-In Engine"])

async def monitor_no_show_lifespan(booking_id: int, db_factory):
    """Asynchronous background worker that waits to verify employee presence."""
    # Using 28 seconds so that when the 30-second frontend countdown reaches 0s, the slot is already auto-released
    await asyncio.sleep(28)
    
    # Provision an isolated session outside the lifespan scope of the HTTP request thread
    async with db_factory() as db:
        result = await db.execute(select(Booking).where(Booking.id == booking_id))
        booking = result.scalar_one_or_none()
        
        if booking and booking.status == "confirmed":
            booking.status = "no_show"
            print(f"🚨 [AUTO-RELEASE] Booking ID {booking_id} flagged as NO-SHOW. Inventory freed.")
            await db.commit()

@router.post("/initialize/{booking_id}")
async def generate_checkin_token(
    booking_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates a secure verification token and registers the auto-release expiration thread."""
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == current_user.id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active booking record not found.")
        
    if booking.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot provision check-in token for status: {booking.status}"
        )

    # Generate an ephemeral secure signature identifier with embedded creation timestamp
    now_ts = int(datetime.now(timezone.utc).timestamp())
    secure_token = f"NEXDESK-VERIFY-{now_ts}-{uuid.uuid4().hex[:6].upper()}"
    booking.check_in_token = secure_token
    
    await db.commit()
    await db.refresh(booking)

    # Offload the execution loop immediately to asyncio event loop
    from app.db.session import AsyncSessionLocal
    asyncio.create_task(monitor_no_show_lifespan(booking.id, AsyncSessionLocal))

    return {
        "message": "Check-in QR payload generated successfully.",
        "booking_id": booking.id,
        "qr_token_string": secure_token,
        "auto_release_window_seconds": 30
    }

@router.post("/verify")
async def verify_physical_presence(
    token_string: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validates the incoming token payload (simulating a physical QR kiosk scanner swipe)."""
    result = await db.execute(select(Booking).where(Booking.check_in_token == token_string))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired QR verification token.")
        
    if booking.status == "no_show":
        raise HTTPException(
            status_code=status.HTTP_410_GONE, 
            detail="Verification window expired. Slot already auto-released by system."
        )

    # Enforce strict 30-second verification window check
    parts = token_string.split("-")
    if len(parts) >= 4 and parts[2].isdigit():
        token_ts = int(parts[2])
        if int(datetime.now(timezone.utc).timestamp()) - token_ts > 30:
            booking.status = "no_show"
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Verification window expired. Slot already auto-released by system."
            )

    if booking.status != "confirmed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Desk already checked-in or modified.")

    # Mutate the status context properties
    booking.status = "checked_in"
    booking.checked_in_at = datetime.now(timezone.utc).replace(tzinfo=None)
    
    await db.commit()
    return {
        "status": "Success",
        "message": f"Physical presence verified for desk {booking.desk_id}. Access granted."
    }