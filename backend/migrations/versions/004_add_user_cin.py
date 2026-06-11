"""Add cin column to users."""

from alembic import op
import sqlalchemy as sa


revision = "004_add_user_cin"
down_revision = "003_add_act_calculations"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("cin", sa.String(20), nullable=True))
    op.create_index("ix_users_cin", "users", ["cin"], unique=True)


def downgrade():
    op.drop_index("ix_users_cin", table_name="users")
    op.drop_column("users", "cin")
