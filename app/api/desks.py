from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.desk import Desk
from app.schemas.desk import DeskResponse, DeskListResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/desks", tags=["Desks"])


@router.get("/", response_model=DeskListResponse)
async def list_desks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all workspace desks with location, base pricing, and amenity metadata."""
    result = await db.execute(select(Desk).order_by(Desk.desk_id))
    desks = result.scalars().all()
    return {"total": len(desks), "desks": desks}
