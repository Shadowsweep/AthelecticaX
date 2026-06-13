from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# If using SQLite, we need connect_args to allow access from multiple threads
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_runtime_schema():
    """Keep existing SQLite development databases compatible with additive fields."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    columns = {column["name"] for column in inspect(engine).get_columns("employee_requests")}
    additions = {
        "first_name": "VARCHAR",
        "last_name": "VARCHAR",
        "department": "VARCHAR",
        "designation": "VARCHAR",
        "registration_ticket_path": "VARCHAR",
    }
    with engine.begin() as connection:
        for name, sql_type in additions.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE employee_requests ADD COLUMN {name} {sql_type}"))
