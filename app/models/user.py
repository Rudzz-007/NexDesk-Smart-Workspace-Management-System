from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # admin, manager, employee
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    usage_type = Column(String, nullable=True)

    # Connects backward relationship to track bookings
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")