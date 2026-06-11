"""Add legal_proof to inheritance_calculations."""

from alembic import op
import sqlalchemy as sa


revision = "002_add_legal_proof"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "inheritance_calculations",
        sa.Column("legal_proof", sa.JSON(), nullable=True),
    )


def downgrade():
    op.drop_column("inheritance_calculations", "legal_proof")
