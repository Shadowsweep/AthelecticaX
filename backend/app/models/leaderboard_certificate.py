from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    employee_profile_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False)
    sport_name = Column(String, nullable=True) # Null means overall point sum rank
    points = Column(Integer, default=0, nullable=False)
    games_played = Column(Integer, default=0, nullable=False)
    games_won = Column(Integer, default=0, nullable=False)
    rank = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="leaderboards")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    employee_profile_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # PARTICIPATION, WINNER, ACHIEVEMENT
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    issue_date = Column(Date, nullable=False)
    pdf_url = Column(String, nullable=False)
    verification_code = Column(String, unique=True, index=True, nullable=False)

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="certificates")
