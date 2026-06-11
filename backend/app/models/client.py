from app.models.base import BaseModel
from app.extensions import db


class Client(BaseModel):
    __tablename__ = "clients"

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    cin = db.Column(db.String(20), nullable=False, index=True)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    address = db.Column(db.Text)
    profession = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    cabinet = db.relationship("Cabinet", back_populates="clients")
    dossiers = db.relationship("Dossier", back_populates="client")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
