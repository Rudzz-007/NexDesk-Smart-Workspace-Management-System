from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    desk_id = Column(String, nullable=False, index=True) # Floor plan node reference (e.g. "DESK-A12")
    
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    
    # Store ML targets and tracking data per booking transaction
    final_price = Column(Float, nullable=False)       # Predicted by Linear Regression
    noshow_probability = Column(Float, nullable=True) # Predicted by Logistic Regression
    status = Column(String, default="confirmed")      # confirmed, checked_in, no_show
    check_in_token = Column(Text, nullable=True, unique=True, index=True)  # Ephemeral QR token
    checked_in_at = Column(DateTime, nullable=True)                        # Timestamp of verified presence

    # Relationships
    user = relationship("User", back_populates="bookings")