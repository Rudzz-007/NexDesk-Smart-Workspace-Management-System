from pydantic import BaseModel
from typing import List, Optional


class DeskResponse(BaseModel):
    id: int
    desk_id: str
    location: str
    base_price: float
    amenities: Optional[str] = None   # Comma-separated string; split on frontend if needed
    is_active: str                     # "available" | "maintenance"

    class Config:
        from_attributes = True


class DeskListResponse(BaseModel):
    total: int
    desks: List[DeskResponse]
