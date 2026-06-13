from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    code = Column(String, unique=True, index=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    manager = relationship("User", foreign_keys=[manager_id])
    assignments = relationship("ProjectAssignment", back_populates="project", cascade="all, delete-orphan")

class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    employee_profile_id = Column(Integer, ForeignKey("employee_profiles.id", ondelete="CASCADE"), nullable=False)
    role_in_project = Column(String, nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    unassigned_at = Column(DateTime, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="assignments")
    profile = relationship("EmployeeProfile", back_populates="project_assignments")
