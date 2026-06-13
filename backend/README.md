# Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:QR_SECRET="use-a-long-random-value"
$env:ADMIN_KEY="change-me"
python seed.py
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`
