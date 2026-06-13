from datetime import date, datetime, timezone
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.profile import EmployeeProfile
from app.models.request import EmployeeRequest

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding users and profiles...")
        
        # 1. Seed Super Admin
        admin_user = User(
            email="admin@athleticax.com",
            password_hash=hash_password("Admin@123"),
            role="SUPER_ADMIN",
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        
        admin_req = EmployeeRequest(
            user_id=admin_user.id,
            status="APPROVED"
        )
        db.add(admin_req)

        # 2. Seed Employee 1 (Aarav Sharma)
        emp1_user = User(
            email="aarav@example.com",
            password_hash=hash_password("Employee@123"),
            role="EMPLOYEE",
            is_active=True
        )
        db.add(emp1_user)
        db.flush()
        
        emp1_req = EmployeeRequest(
            user_id=emp1_user.id,
            status="APPROVED"
        )
        db.add(emp1_req)
        
        emp1_profile = EmployeeProfile(
            user_id=emp1_user.id,
            employee_code="EMP001",
            first_name="Aarav",
            last_name="Sharma",
            department="Engineering",
            designation="Software Engineer",
            joined_date=date.today(),
            qr_code_identifier="QR_EMP001"
        )
        db.add(emp1_profile)

        # 3. Seed Employee 2 (Maya Patel)
        emp2_user = User(
            email="maya@example.com",
            password_hash=hash_password("Employee@123"),
            role="EMPLOYEE",
            is_active=True
        )
        db.add(emp2_user)
        db.flush()
        
        emp2_req = EmployeeRequest(
            user_id=emp2_user.id,
            status="APPROVED"
        )
        db.add(emp2_req)
        
        emp2_profile = EmployeeProfile(
            user_id=emp2_user.id,
            employee_code="EMP002",
            first_name="Maya",
            last_name="Patel",
            department="Operations",
            designation="Operations Manager",
            joined_date=date.today(),
            qr_code_identifier="QR_EMP002"
        )
        db.add(emp2_profile)

        db.commit()
        print("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
