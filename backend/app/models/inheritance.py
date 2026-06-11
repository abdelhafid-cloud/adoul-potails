from app.models.base import BaseModel
from app.extensions import db


class InheritanceCalculation(BaseModel):
    __tablename__ = "inheritance_calculations"

    title = db.Column(db.String(255), nullable=False)
    total_estate_value = db.Column(db.Numeric(15, 2), nullable=False, default=0)
    real_estate_value = db.Column(db.Numeric(15, 2), default=0)
    bank_accounts_value = db.Column(db.Numeric(15, 2), default=0)
    debts = db.Column(db.Numeric(15, 2), default=0)
    fees = db.Column(db.Numeric(15, 2), default=0)
    net_estate_value = db.Column(db.Numeric(15, 2), default=0)
    heirs = db.Column(db.JSON, nullable=False, default=list)
    distribution = db.Column(db.JSON, nullable=False, default=list)
    notes = db.Column(db.Text)
    legal_proof = db.Column(db.JSON, default=dict)

    dossier_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("dossiers.id"), nullable=True)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    dossier = db.relationship("Dossier", back_populates="inheritance_calculations")


class PropertyShare(BaseModel):
    __tablename__ = "property_shares"

    title = db.Column(db.String(255), nullable=False)
    total_value = db.Column(db.Numeric(15, 2), nullable=False, default=0)
    properties = db.Column(db.JSON, nullable=False, default=list)
    heirs = db.Column(db.JSON, nullable=False, default=list)
    distribution = db.Column(db.JSON, nullable=False, default=list)
    soultes = db.Column(db.JSON, default=list)
    notes = db.Column(db.Text)

    dossier_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("dossiers.id"), nullable=True)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    dossier = db.relationship("Dossier", back_populates="property_shares")
