from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE", nullable=False) # SUPER_ADMIN, HR, MANAGER, EMPLOYEE
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    approval_request = relationship("EmployeeRequest", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="EmployeeRequest.user_id")
    profile = relationship("EmployeeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
