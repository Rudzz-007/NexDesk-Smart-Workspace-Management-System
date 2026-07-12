from sqlalchemy import Column, Integer, String, Float, Text
from app.db.base_class import Base


class Desk(Base):
    __tablename__ = "desks"

    id = Column(Integer, primary_key=True, index=True)
    desk_id = Column(String, unique=True, nullable=False, index=True)  # e.g. "DESK-A12"
    location = Column(String, nullable=False)                           # e.g. "Zone A - Main Floor"
    base_price = Column(Float, nullable=False, default=120.0)          # INR base rate
    amenities = Column(Text, nullable=True)                            # Comma-separated, e.g. "WiFi,Monitor,Standing"
    is_active = Column(String, nullable=False, default="available")    # available | maintenance
