"""add signup details and registration ticket

Revision ID: 6a91c3f204d1
Revises: 0ee1be593954
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6a91c3f204d1"
down_revision: Union[str, Sequence[str], None] = "0ee1be593954"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("employee_requests", sa.Column("first_name", sa.String(), nullable=True))
    op.add_column("employee_requests", sa.Column("last_name", sa.String(), nullable=True))
    op.add_column("employee_requests", sa.Column("department", sa.String(), nullable=True))
    op.add_column("employee_requests", sa.Column("designation", sa.String(), nullable=True))
    op.add_column("employee_requests", sa.Column("registration_ticket_path", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("employee_requests", "registration_ticket_path")
    op.drop_column("employee_requests", "designation")
    op.drop_column("employee_requests", "department")
    op.drop_column("employee_requests", "last_name")
    op.drop_column("employee_requests", "first_name")
