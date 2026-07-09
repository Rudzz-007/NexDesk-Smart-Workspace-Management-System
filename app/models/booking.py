from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
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

    # Relationships
    user = relationship("User", back_populates="bookings")