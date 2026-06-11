from app.models.base import BaseModel
from app.extensions import db


class Dossier(BaseModel):
    __tablename__ = "dossiers"

    number = db.Column(db.String(50), nullable=False, index=True)
    title = db.Column(db.String(255))
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="draft")
    description = db.Column(db.Text)
    extra_data = db.Column(db.JSON, default=dict)

    client_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("clients.id"), nullable=False)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    responsible_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    client = db.relationship("Client", back_populates="dossiers")
    cabinet = db.relationship("Cabinet", back_populates="dossiers")
    responsible = db.relationship(
        "User", back_populates="dossiers_responsible", foreign_keys=[responsible_id]
    )
    documents = db.relationship("Document", back_populates="dossier", cascade="all, delete-orphan")
    inheritance_calculations = db.relationship(
        "InheritanceCalculation", back_populates="dossier", cascade="all, delete-orphan"
    )
    property_shares = db.relationship(
        "PropertyShare", back_populates="dossier", cascade="all, delete-orphan"
    )
    act_calculations = db.relationship(
        "ActCalculation", back_populates="dossier", cascade="all, delete-orphan"
    )

    STATUS_DRAFT = "draft"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_PENDING = "pending"
    STATUS_COMPLETED = "completed"
    STATUS_ARCHIVED = "archived"

    TYPE_HERITAGE = "heritage"
    TYPE_SALE = "sale"
    TYPE_DONATION = "donation"
    TYPE_PROCURATION = "procuration"
    TYPE_PROPERTY_SHARE = "property_share"
    TYPE_MARRIAGE = "marriage"
    TYPE_OTHER = "other"


class Document(BaseModel):
    __tablename__ = "documents"

    name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    ocr_data = db.Column(db.JSON, default=dict)
    is_processed = db.Column(db.Boolean, default=False)

    dossier_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("dossiers.id"), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    dossier = db.relationship("Dossier", back_populates="documents")
