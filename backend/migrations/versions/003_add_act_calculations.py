"""Add act_calculations table."""

from alembic import op
import sqlalchemy as sa


revision = "003_add_act_calculations"
down_revision = "002_add_legal_proof"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "act_calculations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("inputs", sa.JSON(), nullable=False),
        sa.Column("results", sa.JSON(), nullable=False),
        sa.Column("legal_proof", sa.JSON(), nullable=True),
        sa.Column("total_amount", sa.Numeric(15, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("dossier_id", sa.UUID(), nullable=True),
        sa.Column("cabinet_id", sa.UUID(), nullable=False),
        sa.Column("created_by", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["cabinet_id"], ["cabinets.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["dossier_id"], ["dossiers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_act_calculations_type", "act_calculations", ["type"])


def downgrade():
    op.drop_index("ix_act_calculations_type", table_name="act_calculations")
    op.drop_table("act_calculations")
