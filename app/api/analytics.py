import sys
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import get_db
from app.models.booking import Booking
from app.api.deps import get_db, get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_workspace_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """Computes administrative operations metrics for desk capacity utilization platforms."""
    # Total bookings counter
    total_result = await db.execute(select(func.count(Booking.id)))
    total_bookings = total_result.scalar() or 0
    
    # Revenue aggregation matrix
    rev_result = await db.execute(select(func.sum(Booking.final_price)).where(Booking.status == "confirmed"))
    total_revenue = rev_result.scalar() or 0.0
    
    # High-risk no-show monitoring filter
    risk_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.noshow_probability > 0.30)
    )
    high_risk_bookings = risk_result.scalar() or 0

    return {
        "total_reservations_processed": total_bookings,
        "total_revenue_generated_inr": round(total_revenue, 2),
        "high_risk_no_show_alerts": high_risk_bookings,
        "system_utilization_index": "Stable"
    }