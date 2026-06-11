from functools import wraps
from flask import request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User, AuditLog
from app.extensions import db


def get_current_user() -> User | None:
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if not user_id:
            return None
        return User.query.filter_by(id=user_id, deleted_at=None).first()
    except Exception:
        return None


def jwt_required_custom(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user or not user.is_active:
            return {"message": "Non autorisé"}, 401
        return f(*args, user=user, **kwargs)

    return decorated


def permission_required(permission: str):
    def decorator(f):
        @wraps(f)
        @jwt_required_custom
        def decorated(*args, user, **kwargs):
            if not user.has_permission(permission):
                return {"message": "Permission refusée"}, 403
            return f(*args, user=user, **kwargs)

        return decorated

    return decorator


def audit_log(action: str, entity_type: str = None, entity_id=None, details: dict = None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            result = f(*args, **kwargs)
            user = args[0] if args and isinstance(args[0], User) else get_current_user()
            if user:
                log = AuditLog(
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    details=details or {},
                    user_id=user.id,
                    cabinet_id=user.cabinet_id,
                    ip_address=request.remote_addr,
                )
                db.session.add(log)
                db.session.commit()
            return result
        return decorated
    return decorator
