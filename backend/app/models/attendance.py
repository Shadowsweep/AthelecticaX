from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from ..core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_profile_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    checked_in_at = Column(DateTime, nullable=False)
    checked_out_at = Column(DateTime, nullable=True)
    work_hours = Column(Float, nullable=True)
    status = Column(String, default="PRESENT", nullable=False) # PRESENT, ABSENT, LATE, HALFDAY

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="attendance_records")
    logs = relationship("AttendanceLog", back_populates="attendance", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("employee_profile_id", "date", name="uq_employee_attendance_date"),
    )

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # TAP_IN, TAP_OUT
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    verified_via_qr = Column(Boolean, default=True, nullable=False)
    ip_address = Column(String, nullable=True)

    # Relationships
    attendance = relationship("Attendance", back_populates="logs")
