import uuid
from datetime import datetime, timezone, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
from app.extensions import db
from app.models import Role, User, Cabinet, AuditLog
from app.constants.moroccan_cities import get_city, is_valid_city
from app.services.upload_service import UploadService


class AuthService:
    @staticmethod
    def register_user(data: dict, profile_file=None) -> tuple[Cabinet, User]:
        """Inscription adoul — ville choisie, espace créé automatiquement (sans concept cabinet côté UI)."""
        owner_role = Role.query.filter_by(name=Role.CABINET_OWNER).first()
        if not owner_role:
            raise ValueError("Rôle utilisateur introuvable. Exécutez les migrations.")

        existing = User.query.filter_by(email=data["email"]).first()
        if existing:
            raise ValueError("Cet email est déjà utilisé.")

        cin = (data.get("cin") or "").strip().upper()
        if not cin or len(cin) < 5:
            raise ValueError("CIN invalide.")
        if User.query.filter_by(cin=cin, deleted_at=None).first():
            raise ValueError("Ce CIN est déjà enregistré.")

        city_code = data.get("city", "")
        if not is_valid_city(city_code):
            raise ValueError("Ville invalide. Choisissez une ville de la liste.")

        city_info = get_city(city_code)
        display_name = f"{data['owner_first_name']} {data['owner_last_name']}"

        # Espace interne (legacy cabinet) — invisible pour l'utilisateur
        cabinet = Cabinet(
            name=display_name,
            owner_name=data["owner_last_name"],
            owner_first_name=data["owner_first_name"],
            phone=data["phone"],
            email=data["email"],
            city=city_info["fr"],
            address=city_info["fr"],
            professional_number=data["professional_number"],
            max_users=1,
            settings={"city_code": city_code},
        )
        db.session.add(cabinet)
        db.session.flush()

        profile_path = None
        if profile_file:
            profile_path = UploadService.save_profile_image(profile_file)

        user = User(
            email=data["email"],
            first_name=data["owner_first_name"],
            last_name=data["owner_last_name"],
            cin=cin,
            profile_image_url=profile_path,
            phone=data["phone"],
            role_id=owner_role.id,
            cabinet_id=cabinet.id,
            is_verified=False,
            email_verification_token=str(uuid.uuid4()),
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return cabinet, user

    @staticmethod
    def register_cabinet(data: dict, profile_file=None) -> tuple[Cabinet, User]:
        """Alias rétrocompatibilité."""
        return AuthService.register_user(data, profile_file)

    @staticmethod
    def login(email: str, password: str, ip_address: str = None) -> dict:
        user = User.query.filter_by(email=email, deleted_at=None).first()
        if not user or not user.check_password(password):
            raise ValueError("Email ou mot de passe incorrect.")
        if not user.is_active:
            raise ValueError("Compte désactivé.")
        if not user.is_verified:
            raise ValueError("Veuillez vérifier votre email avant de vous connecter.")

        user.last_login = datetime.now(timezone.utc)
        user.last_login_ip = ip_address

        AuditLog(
            action="login",
            entity_type="user",
            entity_id=user.id,
            user_id=user.id,
            cabinet_id=user.cabinet_id,
            ip_address=ip_address,
        )
        db.session.commit()

        return AuthService.generate_tokens(user)

    @staticmethod
    def generate_tokens(user: User) -> dict:
        additional_claims = {
            "role": user.role.name if user.role else None,
            "cabinet_id": str(user.cabinet_id) if user.cabinet_id else None,
        }
        return {
            "access_token": create_access_token(
                identity=str(user.id), additional_claims=additional_claims
            ),
            "refresh_token": create_refresh_token(
                identity=str(user.id), additional_claims=additional_claims
            ),
            "user": AuthService.serialize_user(user),
        }

    @staticmethod
    def serialize_user(user: User) -> dict:
        return {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "phone": user.phone,
            "cin": user.cin,
            "profile_image_url": UploadService.public_url(user.profile_image_url),
            "role": user.role.name if user.role else None,
            "cabinet_id": str(user.cabinet_id) if user.cabinet_id else None,
            "city": user.cabinet.city if user.cabinet else None,
            "city_code": (user.cabinet.settings or {}).get("city_code") if user.cabinet else None,
            "is_verified": user.is_verified,
        }

    @staticmethod
    def request_password_reset(email: str) -> tuple[User | None, str | None]:
        user = User.query.filter_by(email=email, deleted_at=None).first()
        if not user:
            return None, None
        token = str(uuid.uuid4())
        user.password_reset_token = token
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=24)
        db.session.commit()
        return user, token

    @staticmethod
    def reset_password(token: str, new_password: str) -> bool:
        user = User.query.filter_by(
            password_reset_token=token, deleted_at=None
        ).first()
        if not user:
            raise ValueError("Token invalide.")
        if user.password_reset_expires < datetime.now(timezone.utc):
            raise ValueError("Token expiré.")
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        db.session.commit()
        return True

    @staticmethod
    def verify_email(token: str) -> bool:
        user = User.query.filter_by(
            email_verification_token=token, deleted_at=None
        ).first()
        if not user:
            raise ValueError("Token de vérification invalide.")
        user.is_verified = True
        user.email_verification_token = None
        db.session.commit()
        return True
