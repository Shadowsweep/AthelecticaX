from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_code = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    joined_date = Column(Date, nullable=False)
    qr_code_identifier = Column(String, unique=True, nullable=False)
    avatar_url = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
    attendance_records = relationship("Attendance", back_populates="profile", cascade="all, delete-orphan")
    project_assignments = relationship("ProjectAssignment", back_populates="profile", cascade="all, delete-orphan")
    sports_registrations = relationship("SportsRegistration", back_populates="profile", cascade="all, delete-orphan")
    leaderboards = relationship("Leaderboard", back_populates="profile", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="profile", cascade="all, delete-orphan")
