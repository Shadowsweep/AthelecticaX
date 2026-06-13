import pytest
from datetime import date
from app.core.security import create_qr_token
from app.models.user import User
from app.models.profile import EmployeeProfile

def test_attendance_and_scan_flow(client, db_session):
    # 1. Register and Login Admin
    client.post(
        "/api/v1/auth/signup",
        json={"email": "admin@athleticax.com", "password": "Password123!", "first_name": "System", "last_name": "Admin", "department": "IT"}
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@athleticax.com", "password": "Password123!"}
    )
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Employee
    client.post(
        "/api/v1/auth/signup",
        json={"email": "employee@athleticax.com", "password": "Password123!", "first_name": "Aarav", "last_name": "Sharma", "department": "Engineering"}
    )
    
    # 3. Approve Employee Registration Request (creates profile and employee ID)
    pending_response = client.get("/api/v1/approval/pending", headers=admin_headers)
    assert pending_response.status_code == 200
    req_id = pending_response.json()[0]["id"]
    client.post(f"/api/v1/approval/review/{req_id}", headers=admin_headers, json={"status": "APPROVED"})
    emp_user = db_session.query(User).filter(User.email == "employee@athleticax.com").first()
    profile = db_session.query(EmployeeProfile).filter(EmployeeProfile.user_id == emp_user.id).first()
    assert profile is not None

    # 5. Login as Employee
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "employee@athleticax.com", "password": "Password123!"}
    )
    emp_token = emp_login.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # 6. Generate QR token and Scan TAP_IN
    token, _ = create_qr_token()
    scan_in_response = client.post(
        "/attendance/scan",
        headers=emp_headers,
        json={"token": token}
    )
    assert scan_in_response.status_code == 200
    data_in = scan_in_response.json()
    assert "Welcome" in data_in["message"]
    assert data_in["action"] == "TAP_IN"

    # 7. Check employee my-logs: should have checked_in_at set, checked_out_at null
    my_logs_in = client.get("/api/v1/attendance/my-logs", headers=emp_headers)
    assert my_logs_in.status_code == 200
    assert len(my_logs_in.json()) == 1
    assert my_logs_in.json()[0]["checked_in_at"] is not None
    assert my_logs_in.json()[0]["checked_out_at"] is None

    # 8. Scan TAP_OUT
    scan_out_response = client.post(
        "/attendance/scan",
        headers=emp_headers,
        json={"token": token}
    )
    assert scan_out_response.status_code == 200
    data_out = scan_out_response.json()
    assert "Goodbye" in data_out["message"]
    assert data_out["action"] == "TAP_OUT"

    # 9. Check employee my-logs: checked_out_at and work_hours should be calculated
    my_logs_out = client.get("/api/v1/attendance/my-logs", headers=emp_headers)
    assert my_logs_out.status_code == 200
    assert my_logs_out.json()[0]["checked_out_at"] is not None
    assert my_logs_out.json()[0]["work_hours"] is not None

    # 10. Check admin logs list: should return employee log details
    admin_logs = client.get("/api/v1/attendance/logs", headers=admin_headers)
    assert admin_logs.status_code == 200
    assert len(admin_logs.json()) >= 1
    assert admin_logs.json()[0]["employee_code"] == profile.employee_code
    assert admin_logs.json()[0]["name"] == "Aarav Sharma"

    # 11. Assert non-admin cannot check logs
    failed_logs = client.get("/api/v1/attendance/logs", headers=emp_headers)
    assert failed_logs.status_code == 403
    assert client.get("/qr/current", headers=emp_headers).status_code == 403

    third_scan = client.post("/attendance/scan", headers=emp_headers, json={"token": token})
    assert third_scan.status_code == 409
