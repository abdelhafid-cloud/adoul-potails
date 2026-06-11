from app.models.base import BaseModel
from app.extensions import db


class Role(BaseModel):
    __tablename__ = "roles"

    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))
    permissions = db.Column(db.JSON, default=list)

    users = db.relationship("User", back_populates="role")

    SUPER_ADMIN = "super_admin"
    CABINET_OWNER = "cabinet_owner"
    ADOUL = "adoul"
    ASSISTANT = "assistant"

    DEFAULT_ROLES = [
        {"name": SUPER_ADMIN, "description": "Accès complet à la plateforme", "permissions": ["*"]},
        {"name": CABINET_OWNER, "description": "Gestion complète du cabinet", "permissions": ["cabinet.*", "users.*", "clients.*", "dossiers.*"]},
        {"name": ADOUL, "description": "Fonctionnalités métier adoul", "permissions": ["clients.*", "dossiers.*", "inheritance.*", "ai.*"]},
        {"name": ASSISTANT, "description": "Permissions limitées", "permissions": ["clients.read", "dossiers.read", "dossiers.create"]},
    ]
