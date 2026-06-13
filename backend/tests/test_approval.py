import pytest

def test_approval_workflow(client):
    # 1. Register first user (SUPER_ADMIN, auto-approved)
    admin_signup = client.post(
        "/api/v1/auth/signup",
        json={"email": "admin@athleticax.com", "password": "Password123!", "first_name": "System", "last_name": "Admin", "department": "IT"}
    )
    assert admin_signup.status_code == 201

    # Login as admin to get token
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@athleticax.com", "password": "Password123!"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register second user (EMPLOYEE, defaults to PENDING approval)
    emp_signup = client.post(
        "/api/v1/auth/signup",
        json={"email": "emp@athleticax.com", "password": "Password123!", "first_name": "Aarav", "last_name": "Sharma", "department": "Engineering"}
    )
    assert emp_signup.status_code == 201

    # Login as employee to get token
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "emp@athleticax.com", "password": "Password123!"}
    )
    assert emp_login.status_code == 200
    emp_token = emp_login.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # 3. Check status of employee: should be PENDING
    status_response = client.get("/api/v1/approval/status", headers=emp_headers)
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "PENDING"
    assert status_response.json()["reason"] is None

    # 4. Check that employee CANNOT view pending queue (Access Denied)
    pending_emp = client.get("/api/v1/approval/pending", headers=emp_headers)
    assert pending_emp.status_code == 403

    # 5. Check that admin CAN view pending queue
    pending_admin = client.get("/api/v1/approval/pending", headers=admin_headers)
    assert pending_admin.status_code == 200
    pending_list = pending_admin.json()
    assert len(pending_list) == 1
    assert pending_list[0]["email"] == "emp@athleticax.com"
    assert pending_list[0]["status"] == "PENDING"
    req_id = pending_list[0]["id"]

    # 6. Admin approves employee request
    review_response = client.post(
        f"/api/v1/approval/review/{req_id}",
        headers=admin_headers,
        json={"status": "APPROVED"}
    )
    assert review_response.status_code == 200
    assert review_response.json()["status"] == "APPROVED"
    assert review_response.json()["employee_code"].startswith("EMP")

    # 7. Check status of employee: should now be APPROVED
    status_response2 = client.get("/api/v1/approval/status", headers=emp_headers)
    assert status_response2.status_code == 200
    assert status_response2.json()["status"] == "APPROVED"

    ticket_response = client.get("/api/v1/approval/ticket", headers=emp_headers)
    assert ticket_response.status_code == 200
    assert ticket_response.headers["content-type"] == "application/pdf"
    assert ticket_response.content.startswith(b"%PDF")

    # 8. Test duplicate review attempt: should fail with 400
    dup_review = client.post(
        f"/api/v1/approval/review/{req_id}",
        headers=admin_headers,
        json={"status": "APPROVED"}
    )
    assert dup_review.status_code == 400


def test_rejection_workflow(client):
    # Register admin
    client.post(
        "/api/v1/auth/signup",
        json={"email": "admin2@athleticax.com", "password": "Password123!", "first_name": "System", "last_name": "Admin", "department": "IT"}
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin2@athleticax.com", "password": "Password123!"}
    )
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register another employee
    client.post(
        "/api/v1/auth/signup",
        json={"email": "emp2@athleticax.com", "password": "Password123!", "first_name": "Maya", "last_name": "Patel", "department": "Operations"}
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": "emp2@athleticax.com", "password": "Password123!"}
    )
    emp_token = emp_login.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # Admin gets pending request ID
    pending_response = client.get("/api/v1/approval/pending", headers=admin_headers)
    req_id = None
    for item in pending_response.json():
        if item["email"] == "emp2@athleticax.com":
            req_id = item["id"]
            break
    assert req_id is not None

    # Admin rejects employee request with a reason
    reject_reason = "Incomplete profile details"
    review_response = client.post(
        f"/api/v1/approval/review/{req_id}",
        headers=admin_headers,
        json={"status": "REJECTED", "reason": reject_reason}
    )
    assert review_response.status_code == 200
    assert review_response.json()["status"] == "REJECTED"

    # Check status of employee: should be REJECTED with reason
    status_response = client.get("/api/v1/approval/status", headers=emp_headers)
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "REJECTED"
    assert status_response.json()["reason"] == reject_reason
