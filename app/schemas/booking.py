from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class BookingBase(BaseModel):
    desk_id: str = Field(..., examples=["DESK-A12"])
    start_time: datetime
    end_time: datetime

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    final_price: float
    noshow_probability: Optional[float] = None
    status: str

    class Config:
        from_attributes = True