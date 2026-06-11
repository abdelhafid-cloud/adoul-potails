from app.models.base import BaseModel
from app.models.role import Role
from app.models.user import User, Cabinet
from app.models.client import Client
from app.models.dossier import Dossier, Document
from app.models.inheritance import InheritanceCalculation, PropertyShare
from app.models.act_calculation import ActCalculation
from app.models.ai import AIConversation, AIMessage, Notification, AuditLog, Setting

__all__ = [
    "Role",
    "User",
    "Cabinet",
    "Client",
    "Dossier",
    "Document",
    "InheritanceCalculation",
    "PropertyShare",
    "ActCalculation",
    "AIConversation",
    "AIMessage",
    "Notification",
    "AuditLog",
    "Setting",
]
