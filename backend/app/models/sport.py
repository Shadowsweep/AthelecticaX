from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class SportsRegistration(Base):
    __tablename__ = "sports_registrations"

    id = Column(Integer, primary_key=True, index=True)
    employee_profile_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False)
    sport_name = Column(String, nullable=False) # SOCCER, BASKETBALL, BADMINTON, TABLE_TENNIS, CRICKET
    skill_level = Column(String, nullable=False) # BEGINNER, INTERMEDIATE, ADVANCED
    time_slot = Column(String, nullable=False) # BEFORE_OFFICE, OFFICE_HOURS, AFTER_OFFICE
    approval_status = Column(String, default="PENDING", nullable=False) # PENDING, APPROVED, REJECTED
    approved_by_manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="sports_registrations")
    manager = relationship("User", foreign_keys=[approved_by_manager_id])
    pass_card = relationship("SportsPass", back_populates="registration", uselist=False, cascade="all, delete-orphan")

class SportsPass(Base):
    __tablename__ = "sports_passes"

    id = Column(Integer, primary_key=True, index=True)
    sports_registration_id = Column(Integer, ForeignKey("sports_registrations.id", ondelete="CASCADE"), unique=True, nullable=False)
    pass_code = Column(String, unique=True, index=True, nullable=False)
    pdf_url = Column(String, nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    registration = relationship("SportsRegistration", back_populates="pass_card")
