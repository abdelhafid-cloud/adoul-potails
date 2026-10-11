from datetime import datetime, timezone

from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy import func
from app.middleware.auth import jwt_required_custom, permission_required
from app.models import (
    Client, Dossier, InheritanceCalculation, PropertyShare,
    Document, AuditLog, User, Cabinet,
    ActCalculation,
)
from app.models.role import Role
from app.models.dossier import Dossier as DossierModel
from app.services.activity_service import serialize_activity
from app.services.upload_service import UploadService

dashboard_ns = Namespace("dashboard", description="Tableau de bord")
admin_ns = Namespace("admin", description="Administration")


def _admin_user_dict(user: User, **extra) -> dict:
    data = {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "profile_image_url": UploadService.public_url(user.profile_image_url),
        "role": user.role.name if user.role else None,
        "cabinet_id": str(user.cabinet_id) if user.cabinet_id else None,
        "cabinet_name": user.cabinet.name if user.cabinet else None,
        "cabinet_city": user.cabinet.city if user.cabinet else None,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
    data.update(extra)
    return data


@dashboard_ns.route("/stats")
class DashboardStats(Resource):
    @jwt_required_custom
    def get(self, user):
        cabinet_id = user.cabinet_id
        inheritance_count = InheritanceCalculation.query.filter_by(
            cabinet_id=cabinet_id, deleted_at=None
        ).count()
        property_count = PropertyShare.query.filter_by(
            cabinet_id=cabinet_id, deleted_at=None
        ).count()
        act_count = ActCalculation.query.filter_by(
            cabinet_id=cabinet_id, deleted_at=None
        ).count()

        return {
            "dossiers_count": Dossier.query.filter_by(
                cabinet_id=cabinet_id, deleted_at=None
            ).count(),
            "clients_count": Client.query.filter_by(
                cabinet_id=cabinet_id, deleted_at=None
            ).count(),
            "calculations_count": inheritance_count + property_count + act_count,
            "documents_count": Document.query.join(Dossier).filter(
                Dossier.cabinet_id == cabinet_id, Document.deleted_at.is_(None)
            ).count(),
            "pending_dossiers_count": Dossier.query.filter(
                Dossier.cabinet_id == cabinet_id,
                Dossier.deleted_at.is_(None),
                Dossier.status.in_([
                    DossierModel.STATUS_DRAFT,
                    DossierModel.STATUS_IN_PROGRESS,
                    DossierModel.STATUS_PENDING,
                ]),
            ).count(),
            "recent_dossiers": _recent_dossiers(cabinet_id),
            "recent_activity": _get_recent_activity(user),
            "dossiers_by_type": _dossiers_by_type(cabinet_id),
        }, 200


def _recent_dossiers(cabinet_id, limit=5):
    dossiers = (
        Dossier.query.filter_by(cabinet_id=cabinet_id, deleted_at=None)
        .order_by(Dossier.updated_at.desc())
        .limit(limit)
        .all()
    )
    return [{
        "id": str(d.id),
        "number": d.number,
        "title": d.title,
        "type": d.type,
        "status": d.status,
        "client_name": d.client.full_name if d.client else None,
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    } for d in dossiers]


def _get_recent_activity(user, limit=15):
    logs = (
        AuditLog.query.filter_by(cabinet_id=user.cabinet_id)
        .filter(AuditLog.action.notin_(["login", "logout"]))
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [serialize_activity(l) for l in logs]


def _dossiers_by_type(cabinet_id):
    results = Dossier.query.filter_by(
        cabinet_id=cabinet_id, deleted_at=None
    ).with_entities(Dossier.type, func.count(Dossier.id)).group_by(Dossier.type).all()
    return {dtype: count for dtype, count in results}


@admin_ns.route("/stats")
class AdminStats(Resource):
    @permission_required("*")
    def get(self, user):
        inheritance = InheritanceCalculation.query.filter_by(deleted_at=None).count()
        acts = ActCalculation.query.filter_by(deleted_at=None).count()
        property_c = PropertyShare.query.filter_by(deleted_at=None).count()
        adouls = User.query.join(Role).filter(
            User.deleted_at.is_(None),
            Role.name != Role.SUPER_ADMIN,
        ).count()
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        return {
            "cabinets_count": Cabinet.query.filter_by(deleted_at=None, is_active=True).count(),
            "users_count": User.query.filter_by(deleted_at=None, is_active=True).count(),
            "adouls_count": adouls,
            "clients_count": Client.query.filter_by(deleted_at=None).count(),
            "dossiers_count": Dossier.query.filter_by(deleted_at=None).count(),
            "calculations_count": inheritance + acts + property_c,
            "activity_today": AuditLog.query.filter(AuditLog.created_at >= today_start).count(),
        }, 200


@admin_ns.route("/cabinets")
class AdminCabinets(Resource):
    @permission_required("*")
    def get(self, user):
        cabinets = Cabinet.query.filter_by(deleted_at=None).order_by(Cabinet.name).all()
        result = []
        for c in cabinets:
            last_log = (
                AuditLog.query.filter_by(cabinet_id=c.id)
                .order_by(AuditLog.created_at.desc())
                .first()
            )
            result.append({
                "id": str(c.id),
                "name": c.name,
                "owner_name": c.owner_name,
                "email": c.email,
                "city": c.city,
                "phone": c.phone,
                "is_active": c.is_active,
                "users_count": User.query.filter_by(cabinet_id=c.id, deleted_at=None).count(),
                "clients_count": Client.query.filter_by(cabinet_id=c.id, deleted_at=None).count(),
                "dossiers_count": Dossier.query.filter_by(cabinet_id=c.id, deleted_at=None).count(),
                "last_activity_at": last_log.created_at.isoformat() if last_log and last_log.created_at else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })
        return result, 200


@admin_ns.route("/adouls")
class AdminAdouls(Resource):
    @permission_required("*")
    def get(self, user):
        cabinet_id = request.args.get("cabinet_id")
        query = (
            User.query.join(Role)
            .filter(
                User.deleted_at.is_(None),
                Role.name.in_([Role.ADOUL, Role.CABINET_OWNER]),
            )
        )
        if cabinet_id:
            query = query.filter_by(cabinet_id=cabinet_id)
        users = query.order_by(User.last_login.desc().nullslast(), User.created_at.desc()).all()
        result = []
        for u in users:
            last_log = (
                AuditLog.query.filter_by(user_id=u.id)
                .order_by(AuditLog.created_at.desc())
                .first()
            )
            dossiers_count = Dossier.query.filter_by(
                responsible_id=u.id, deleted_at=None
            ).count()
            result.append(_admin_user_dict(
                u,
                last_activity_at=last_log.created_at.isoformat() if last_log and last_log.created_at else None,
                dossiers_count=dossiers_count,
            ))
        return result, 200


@admin_ns.route("/users")
class AdminUsers(Resource):
    @permission_required("*")
    def get(self, user):
        cabinet_id = request.args.get("cabinet_id")
        query = User.query.filter_by(deleted_at=None)
        if cabinet_id:
            query = query.filter_by(cabinet_id=cabinet_id)
        users = query.order_by(User.created_at.desc()).all()
        return [_admin_user_dict(u) for u in users], 200


@admin_ns.route("/activity")
class AdminActivity(Resource):
    @permission_required("*")
    def get(self, user):
        limit = min(int(request.args.get("limit", 50)), 200)
        cabinet_id = request.args.get("cabinet_id")
        user_id = request.args.get("user_id")
        action_filter = request.args.get("action")

        query = AuditLog.query.filter(AuditLog.action.notin_(["login", "logout"]))
        if cabinet_id:
            query = query.filter_by(cabinet_id=cabinet_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if action_filter:
            query = query.filter_by(action=action_filter)

        logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
        return [serialize_activity(l, include_cabinet=True) for l in logs], 200
