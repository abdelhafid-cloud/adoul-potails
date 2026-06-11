from app.models.base import BaseModel
from app.extensions import db


class AIConversation(BaseModel):
    __tablename__ = "ai_conversations"

    title = db.Column(db.String(255), default="Nouvelle conversation")
    context = db.Column(db.JSON, default=dict)

    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=False)
    dossier_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("dossiers.id"), nullable=True)

    user = db.relationship("User", back_populates="ai_conversations")
    messages = db.relationship(
        "AIMessage", back_populates="conversation", cascade="all, delete-orphan",
        order_by="AIMessage.created_at"
    )


class AIMessage(BaseModel):
    __tablename__ = "ai_messages"

    role = db.Column(db.String(20), nullable=False)  # user, assistant, system
    content = db.Column(db.Text, nullable=False)
    extra_data = db.Column(db.JSON, default=dict)

    conversation_id = db.Column(
        db.UUID(as_uuid=True), db.ForeignKey("ai_conversations.id"), nullable=False
    )

    conversation = db.relationship("AIConversation", back_populates="messages")


class Notification(BaseModel):
    __tablename__ = "notifications"

    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default="info")
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(500))

    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="notifications")


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.UUID(as_uuid=True))
    details = db.Column(db.JSON, default=dict)
    ip_address = db.Column(db.String(45))

    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=True)

    user = db.relationship("User", back_populates="audit_logs")


class Setting(BaseModel):
    __tablename__ = "settings"

    key = db.Column(db.String(100), nullable=False, index=True)
    value = db.Column(db.JSON, nullable=False, default=dict)
    scope = db.Column(db.String(50), default="global")  # global, cabinet
    cabinet_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("cabinets.id"), nullable=True)

    __table_args__ = (
        db.UniqueConstraint("key", "scope", "cabinet_id", name="uq_settings_key_scope"),
    )
