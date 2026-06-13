# AthleticaX Employee Management System

FastAPI and Next.js employee approval and dynamic QR attendance system.

## Completed Workflow

- Employee self-signup with name, department, designation, email, and password
- Pending approval screen after signup
- Admin approval or rejection with a required rejection reason
- Employee profile and unique employee ID generated during approval
- Registration-ticket PDF generated and attached to the approval email
- Approval email includes a congratulations message and employee ID
- Rejection email includes the administrator's reason
- Approved employee email/password login
- Authenticated dynamic QR tap-in and tap-out
- Welcome message after tap-in and Goodbye message after tap-out
- Home redirect after a successful attendance scan
- Work-hours calculation and protection against a third daily scan

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:QR_SECRET="replace-with-a-long-random-secret"
$env:JWT_SECRET="replace-with-another-long-random-secret"
$env:FRONTEND_URL="http://localhost:3000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI startup safely adds the new signup-detail columns to existing SQLite
development databases. The equivalent Alembic migration can also be applied with:

```powershell
alembic upgrade head
```

## Frontend

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev -- -H 0.0.0.0
```

## Approval Emails

Configure `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM`.
Without SMTP configuration, approval and rejection emails are printed in the backend
terminal for local testing.

## Mobile Testing

Set `FRONTEND_URL` to the computer's LAN address, such as
`http://192.168.1.242:3000`, and open that same address from the employee's phone.
The employee must log in before scanning the company QR.

## Verification

- Backend: `pytest -q`
- Frontend: `npm run build`
