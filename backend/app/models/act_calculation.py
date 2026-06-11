from app.models.base import BaseModel
from app.extensions import db


class ActCalculation(BaseModel):
    """Calculs liés aux actes : vente, donation, procuration, autre."""

    __tablename__ = "act_calculations"

    type = db.Column(db.String(50), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    inputs = db.Column(db.JSON, nullable=False, default=dict)
    results = db.Column(db.JSON, nullable=False, default=dict)
    legal_proof = db.Column(db.JSON, default=dict)
    total_amount = db.Column(db.Numeric(15, 2), default=0)
    notes = db.Column(db.Text)

    dossier_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("dossiers.id"), nullable=True)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    dossier = db.relationship("Dossier", back_populates="act_calculations")
