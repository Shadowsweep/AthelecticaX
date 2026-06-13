import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone, date
from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .core.config import settings
from .core.database import engine, Base, get_db
from .core.security import create_qr_token, verify_qr_token
from .models.user import User
from .models.profile import EmployeeProfile
from .models.attendance import Attendance, AttendanceLog
from .models.request import EmployeeRequest
from .schemas.auth import UserCreate
from .api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created (though we also use Alembic)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0.0", 
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|"
        r"192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Legacy Require Admin (using environment key header verification for backward compatibility)
ADMIN_KEY = os.getenv("ADMIN_KEY", "change-me")

def require_admin(x_admin_key: str = Header(default="")):
    if not ADMIN_KEY or not __import__("hmac").compare_digest(x_admin_key, ADMIN_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid admin key."
        )

# Helper to format legacy employee dict
def employee_dict(profile: EmployeeProfile):
    aware_created = profile.user.created_at.replace(tzinfo=timezone.utc)
    return {
        "id": profile.id,
        "employee_code": profile.employee_code,
        "name": f"{profile.first_name} {profile.last_name}",
        "email": profile.user.email,
        "department": profile.department,
        "active": profile.user.is_active,
        "created_at": aware_created.isoformat(),
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# Legacy GET /employees refactored to query EmployeeProfile
@app.get("/employees", dependencies=[Depends(require_admin)])
def list_employees(db: Session = Depends(get_db)):
    profiles = db.query(EmployeeProfile).join(User).order_by(EmployeeProfile.first_name).all()
    return [employee_dict(p) for p in profiles]

# Legacy POST /employees refactored to create User + Profile

@app.post("/employees", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_employee(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "").strip().lower()
    code = data.get("employee_code", "").strip().upper()
    name = data.get("name", "").strip()
    department = data.get("department", "").strip()

    if not email or not code or not name:
        raise HTTPException(
            status_code=400, 
            detail="Missing required fields: email, employee_code, or name"
        )

    # Split name into first and last name
    name_parts = name.split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # Check email or code existence
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already exists.")
    
    existing_profile = db.query(EmployeeProfile).filter(EmployeeProfile.employee_code == code).first()
    if existing_profile:
        raise HTTPException(status_code=409, detail="Employee code already exists.")

    try:
        # Create User
        # Default password is "AthleticaX@123" for legacy seeded employees
        from .core.security import hash_password
        user = User(
            email=email,
            password_hash=hash_password("AthleticaX@123"),
            role="EMPLOYEE",
            is_active=True
        )
        db.add(user)
        db.flush()

        # Auto approve request
        req = EmployeeRequest(user_id=user.id, status="APPROVED")
        db.add(req)

        # Create Profile
        profile = EmployeeProfile(
            user_id=user.id,
            employee_code=code,
            first_name=first_name,
            last_name=last_name,
            department=department,
            designation="Software Engineer",
            joined_date=date.today(),
            qr_code_identifier=f"QR_{code}"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return employee_dict(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create employee: {str(e)}")

# Legacy DELETE /employees/{id} refactored to set active = 0 on user
@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def deactivate_employee(employee_id: int, db: Session = Depends(get_db)):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.id == employee_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found.")
    
    profile.user.is_active = False
    db.commit()

# Legacy GET /qr/current
@app.get("/qr/current", dependencies=[Depends(require_admin)])
def current_qr():
    token, expires_at = create_qr_token()
    return {
        "token": token,
        "expires_at": expires_at,
        "scan_url": f"{settings.FRONTEND_URL}/scan?token={token}",
    }

# Legacy POST /attendance/scan refactored to support EmployeeProfile and AttendanceLogs
@app.post("/attendance/scan")
def scan_attendance(data: dict, db: Session = Depends(get_db)):
    token = data.get("token")
    employee_code = data.get("employee_code", "").strip().upper()

    if not token or not employee_code:
        raise HTTPException(status_code=400, detail="Missing token or employee_code")

    verify_qr_token(token)
    
    # Query profile
    profile = db.query(EmployeeProfile).join(User).filter(
        EmployeeProfile.employee_code == employee_code,
        User.is_active == True
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Active employee code not found.")

    now = datetime.now(timezone.utc)
    today = now.date()

    # Check if attendance already exists for today
    attendance = db.query(Attendance).filter(
        Attendance.employee_profile_id == profile.id,
        Attendance.date == today
    ).first()

    if attendance:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance is already recorded for today."
        )

    try:
        # Create attendance entry
        attendance = Attendance(
            employee_profile_id=profile.id,
            date=today,
            checked_in_at=now,
            status="PRESENT"
        )
        db.add(attendance)
        db.flush()

        # Add tap-in log
        log = AttendanceLog(
            attendance_id=attendance.id,
            action="TAP_IN",
            timestamp=now,
            verified_via_qr=True
        )
        db.add(log)
        db.commit()
        db.refresh(profile)
        return {"message": "Attendance recorded successfully.", "employee": employee_dict(profile)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Legacy GET /attendance refactored
@app.get("/attendance", dependencies=[Depends(require_admin)])
def list_attendance(date_str: str | None = Query(default=None, alias="date"), db: Session = Depends(get_db)):
    if date_str:
        try:
            query_date = date.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        query_date = datetime.now(timezone.utc).date()

    rows = db.query(Attendance).filter(Attendance.date == query_date).order_by(Attendance.checked_in_at.desc()).all()
    
    res = []
    for r in rows:
        # Convert naive UTC datetime from database to aware UTC ISO string
        aware_dt = r.checked_in_at.replace(tzinfo=timezone.utc)
        res.append({
            "id": r.id,
            "attendance_date": r.date.isoformat(),
            "checked_in_at": aware_dt.isoformat(),
            "employee_code": r.profile.employee_code,
            "name": f"{r.profile.first_name} {r.profile.last_name}",
            "department": r.profile.department
        })
    return res
