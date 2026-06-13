from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import timezone

from ....core.database import get_db
from ....core.deps import get_current_user, get_current_approved_user, RoleChecker
from ....models.user import User
from ....models.profile import EmployeeProfile
from ....models.attendance import Attendance

router = APIRouter()

class MyLogResponse(BaseModel):
    id: int
    date: str
    checked_in_at: str
    checked_out_at: Optional[str] = None
    work_hours: Optional[float] = None
    status: str

    class Config:
        from_attributes = True

class AdminLogResponse(BaseModel):
    id: int
    employee_code: str
    name: str
    department: str
    date: str
    checked_in_at: str
    checked_out_at: Optional[str] = None
    work_hours: Optional[float] = None
    status: str

    class Config:
        from_attributes = True

@router.get("/my-logs", response_model=List[MyLogResponse])
def get_my_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_approved_user)
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found for this account."
        )

    records = db.query(Attendance).filter(
        Attendance.employee_profile_id == profile.id
    ).order_by(Attendance.date.desc()).all()

    res = []
    for r in records:
        in_aware = r.checked_in_at.replace(tzinfo=timezone.utc)
        out_aware = r.checked_out_at.replace(tzinfo=timezone.utc) if r.checked_out_at else None
        res.append({
            "id": r.id,
            "date": r.date.isoformat(),
            "checked_in_at": in_aware.isoformat(),
            "checked_out_at": out_aware.isoformat() if out_aware else None,
            "work_hours": r.work_hours,
            "status": r.status
        })
    return res

@router.get("/logs", response_model=List[AdminLogResponse])
def get_all_logs(
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["SUPER_ADMIN"]))
):
    records = db.query(Attendance).join(
        EmployeeProfile, Attendance.employee_profile_id == EmployeeProfile.id
    ).order_by(Attendance.date.desc(), Attendance.checked_in_at.desc()).all()

    res = []
    for r in records:
        in_aware = r.checked_in_at.replace(tzinfo=timezone.utc)
        out_aware = r.checked_out_at.replace(tzinfo=timezone.utc) if r.checked_out_at else None
        res.append({
            "id": r.id,
            "employee_code": r.profile.employee_code,
            "name": f"{r.profile.first_name} {r.profile.last_name}",
            "department": r.profile.department,
            "date": r.date.isoformat(),
            "checked_in_at": in_aware.isoformat(),
            "checked_out_at": out_aware.isoformat() if out_aware else None,
            "work_hours": r.work_hours,
            "status": r.status
        })
    return res
