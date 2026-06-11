import bcrypt
from app.models.base import BaseModel
from app.extensions import db


class Cabinet(BaseModel):
    __tablename__ = "cabinets"

    name = db.Column(db.String(255), nullable=False)
    owner_name = db.Column(db.String(255), nullable=False)
    owner_first_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    professional_number = db.Column(db.String(50), nullable=False)
    max_users = db.Column(db.Integer, default=5)
    is_active = db.Column(db.Boolean, default=True)
    logo_url = db.Column(db.String(500))
    settings = db.Column(db.JSON, default=dict)

    users = db.relationship("User", back_populates="cabinet")
    clients = db.relationship("Client", back_populates="cabinet")
    dossiers = db.relationship("Dossier", back_populates="cabinet")


class User(BaseModel):
    __tablename__ = "users"

    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    cin = db.Column(db.String(20), unique=True, nullable=True, index=True)
    profile_image_url = db.Column(db.String(500), nullable=True)
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(255))
    password_reset_token = db.Column(db.String(255))
    password_reset_expires = db.Column(db.DateTime(timezone=True))
    last_login = db.Column(db.DateTime(timezone=True))
    last_login_ip = db.Column(db.String(45))

    role_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("roles.id"), nullable=False)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=True)

    role = db.relationship("Role", back_populates="users")
    cabinet = db.relationship("Cabinet", back_populates="users")
    created_by = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)

    dossiers_responsible = db.relationship(
        "Dossier", back_populates="responsible", foreign_keys="Dossier.responsible_id"
    )
    audit_logs = db.relationship("AuditLog", back_populates="user")
    notifications = db.relationship("Notification", back_populates="user")
    ai_conversations = db.relationship("AIConversation", back_populates="user")

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def has_permission(self, permission: str) -> bool:
        if not self.role or not self.role.permissions:
            return False
        perms = self.role.permissions
        if "*" in perms:
            return True
        if permission in perms:
            return True
        prefix = permission.split(".")[0]
        return f"{prefix}.*" in perms
