"""Add profile_image_url to users."""

from alembic import op
import sqlalchemy as sa


revision = "005_add_profile_image"
down_revision = "004_add_user_cin"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("profile_image_url", sa.String(500), nullable=True))


def downgrade():
    op.drop_column("users", "profile_image_url")
