from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from pathlib import Path
from fastapi.responses import FileResponse

from ....core.database import get_db
from ....core.deps import get_current_user, RoleChecker
from ....models.user import User
from ....models.request import EmployeeRequest
from ....models.profile import EmployeeProfile
from ....services.mail_service import send_approval_email, send_rejection_email
from ....services.registration_ticket import generate_registration_ticket

router = APIRouter()

# Schema for review inputs
class ReviewInput(BaseModel):
    status: str # APPROVED or REJECTED
    reason: Optional[str] = None

class StatusResponse(BaseModel):
    status: str
    reason: Optional[str] = None

class PendingRequestResponse(BaseModel):
    id: int
    user_id: int
    email: str
    status: str
    created_at: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/status", response_model=StatusResponse)
def get_approval_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(EmployeeRequest).filter(EmployeeRequest.user_id == current_user.id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration request found for this account"
        )
    return {
        "status": req.status,
        "reason": req.review_reason
    }

@router.get("/pending", response_model=List[PendingRequestResponse])
def list_pending_requests(
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["SUPER_ADMIN"]))
):
    pending = db.query(EmployeeRequest).join(User, EmployeeRequest.user_id == User.id).filter(EmployeeRequest.status == "PENDING").all()
    
    res = []
    for p in pending:
        res.append({
            "id": p.id,
            "user_id": p.user_id,
            "email": p.user.email,
            "status": p.status,
            "created_at": p.created_at.isoformat()
            ,"first_name": p.first_name
            ,"last_name": p.last_name
            ,"department": p.department
            ,"designation": p.designation
        })
    return res

@router.post("/review/{request_id}")
async def review_request(
    request_id: int,
    review_in: ReviewInput,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["SUPER_ADMIN"]))
):
    if review_in.status.upper() not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either APPROVED or REJECTED"
        )

    req = db.query(EmployeeRequest).filter(EmployeeRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration request not found"
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request has already been reviewed"
        )

    recipient_email = req.user.email
    name = f"{req.first_name or ''} {req.last_name or ''}".strip() or recipient_email.split("@")[0].capitalize()
    employee_code = None
    ticket_path = None

    if review_in.status.upper() == "REJECTED" and not (review_in.reason or "").strip():
        raise HTTPException(status_code=400, detail="A rejection reason is required")

    if review_in.status.upper() == "APPROVED":
        profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == req.user_id).first()
        if not profile:
            next_number = (db.query(EmployeeProfile).count() + 1)
            employee_code = f"EMP{next_number:04d}"
            while db.query(EmployeeProfile).filter(EmployeeProfile.employee_code == employee_code).first():
                next_number += 1
                employee_code = f"EMP{next_number:04d}"
            profile = EmployeeProfile(
                user_id=req.user_id,
                employee_code=employee_code,
                first_name=req.first_name or name,
                last_name=req.last_name or "",
                department=req.department or "Unassigned",
                designation=req.designation or "Employee",
                joined_date=date.today(),
                qr_code_identifier=f"QR_{employee_code}",
            )
            db.add(profile)
            db.flush()
        employee_code = profile.employee_code
        ticket_path = generate_registration_ticket(
            employee_code=profile.employee_code,
            name=f"{profile.first_name} {profile.last_name}".strip(),
            email=recipient_email,
            department=profile.department,
            designation=profile.designation,
        )
        req.registration_ticket_path = ticket_path

    req.status = review_in.status.upper()
    req.reviewed_by = current_admin.id
    req.review_reason = review_in.reason
    db.commit()
    db.refresh(req)

    if req.status == "APPROVED":
        await send_approval_email(recipient_email, name, employee_code or "", ticket_path)
    else:
        await send_rejection_email(recipient_email, name, review_in.reason or "No reason provided.")

    return {
        "message": f"Registration request successfully {req.status.lower()}.",
        "status": req.status,
        "employee_code": employee_code,
    }

@router.get("/ticket")
def download_registration_ticket(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(EmployeeRequest).filter(EmployeeRequest.user_id == current_user.id).first()
    if not req or req.status != "APPROVED" or not req.registration_ticket_path:
        raise HTTPException(status_code=404, detail="Registration ticket is not available")
    ticket = Path(req.registration_ticket_path)
    if not ticket.exists():
        raise HTTPException(status_code=404, detail="Registration ticket file is missing")
    return FileResponse(ticket, media_type="application/pdf", filename=ticket.name)
