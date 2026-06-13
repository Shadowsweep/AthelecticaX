def test_signup_first_user_is_super_admin(client):
    # Register the first user
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "first@athleticax.com", "password": "Password123!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "first@athleticax.com"
    # First user must automatically become SUPER_ADMIN
    assert data["role"] == "SUPER_ADMIN"
    assert data["is_active"] is True

def test_signup_subsequent_user_is_employee_pending(client):
    # Bootstrap the first user as SUPER_ADMIN
    client.post(
        "/api/v1/auth/signup",
        json={"email": "admin@athleticax.com", "password": "Password123!"}
    )
    
    # Register a second user
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "employee@athleticax.com", "password": "Password123!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "employee@athleticax.com"
    # Subsequent users must become EMPLOYEE
    assert data["role"] == "EMPLOYEE"

def test_signup_duplicate_email(client):
    # Register user
    client.post(
        "/api/v1/auth/signup",
        json={"email": "dup@athleticax.com", "password": "Password123!"}
    )
    # Register user with same email
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "dup@athleticax.com", "password": "Password123!"}
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "An account with this email already exists."

def test_login_success(client):
    # Register first user
    client.post(
        "/api/v1/auth/signup",
        json={"email": "login@athleticax.com", "password": "Password123!"}
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@athleticax.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@athleticax.com"

def test_login_incorrect_password(client):
    # Register first user
    client.post(
        "/api/v1/auth/signup",
        json={"email": "incorrect@athleticax.com", "password": "Password123!"}
    )
    # Login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "incorrect@athleticax.com", "password": "WrongPassword!"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_token_refresh(client):
    # Register first user
    client.post(
        "/api/v1/auth/signup",
        json={"email": "refresh@athleticax.com", "password": "Password123!"}
    )
    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "refresh@athleticax.com", "password": "Password123!"}
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh token
    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "refresh@athleticax.com"

def test_logout(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
