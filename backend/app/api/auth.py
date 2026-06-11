from flask import current_app, request, make_response
from flask_restx import Namespace, Resource, fields
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.middleware.auth import get_current_user, jwt_required_custom
from app.extensions import db
from app.models import User, AuditLog
from app.constants.moroccan_cities import MOROCCAN_CITIES
from app.services.upload_service import UploadService

auth_ns = Namespace("auth", description="Authentification")

register_model = auth_ns.model("RegisterUser", {
    "owner_first_name": fields.String(required=True),
    "owner_last_name": fields.String(required=True),
    "cin": fields.String(required=True, description="Carte d'identité nationale (CIN)"),
    "phone": fields.String(required=True),
    "email": fields.String(required=True),
    "city": fields.String(required=True, description="Code ville (liste /auth/cities)"),
    "professional_number": fields.String(required=True),
    "password": fields.String(required=True),
})

login_model = auth_ns.model("Login", {
    "email": fields.String(required=True),
    "password": fields.String(required=True),
})


REGISTER_FIELDS = (
    "owner_first_name",
    "owner_last_name",
    "cin",
    "phone",
    "email",
    "city",
    "professional_number",
    "password",
)


def _parse_register_payload():
    if request.content_type and "multipart/form-data" in request.content_type:
        data = {field: (request.form.get(field) or "").strip() for field in REGISTER_FIELDS}
        profile_file = request.files.get("profile_image")
        return data, profile_file
    payload = auth_ns.payload or request.get_json(silent=True) or {}
    return payload, None


@auth_ns.route("/register")
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        try:
            data, profile_file = _parse_register_payload()
            if not data.get("email"):
                return {"message": "Données d'inscription invalides."}, 400
            cabinet, user = AuthService.register_user(data, profile_file)
            email_sent = EmailService.send_verification_email(
                user.email,
                user.first_name,
                user.email_verification_token,
            )
            response = {
                "message": (
                    "Un email de confirmation a été envoyé. Vérifiez votre boîte de réception."
                    if email_sent
                    else "Compte créé. SMTP non configuré : vérifiez les logs du serveur ou utilisez le lien de vérification."
                ),
                "user_id": str(user.id),
                "city": cabinet.city,
                "email_sent": email_sent,
            }
            if not email_sent and current_app.debug:
                response["verification_token"] = user.email_verification_token
            return response, 201
        except ValueError as e:
            return {"message": str(e)}, 400


@auth_ns.route("/cities")
class MoroccanCities(Resource):
    def get(self):
        return MOROCCAN_CITIES, 200


@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        try:
            data = AuthService.login(
                auth_ns.payload["email"],
                auth_ns.payload["password"],
                ip_address=request.remote_addr,
            )
            return data, 200
        except ValueError as e:
            return {"message": str(e)}, 401


@auth_ns.route("/refresh")
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        user = get_current_user()
        if not user:
            return {"message": "Utilisateur introuvable"}, 401
        tokens = AuthService.generate_tokens(user)
        return {"access_token": tokens["access_token"]}, 200


@auth_ns.route("/me")
class Me(Resource):
    @jwt_required_custom
    def get(self, user):
        return AuthService.serialize_user(user), 200


@auth_ns.route("/me/profile-image")
class MeProfileImage(Resource):
    @jwt_required_custom
    def post(self, user):
        profile_file = request.files.get("profile_image")
        if not profile_file or not profile_file.filename:
            return {"message": "Aucune image fournie."}, 400
        try:
            user.profile_image_url = UploadService.save_profile_image(profile_file)
            db.session.commit()
            return {"user": AuthService.serialize_user(user)}, 200
        except ValueError as e:
            return {"message": str(e)}, 400


@auth_ns.route("/logout")
class Logout(Resource):
    @jwt_required_custom
    def post(self, user):
        log = AuditLog(
            action="logout",
            entity_type="user",
            entity_id=user.id,
            user_id=user.id,
            cabinet_id=user.cabinet_id,
        )
        db.session.add(log)
        db.session.commit()
        return {"message": "Déconnexion réussie"}, 200


@auth_ns.route("/forgot-password")
class ForgotPassword(Resource):
    def post(self):
        email = auth_ns.payload.get("email")
        user, token = AuthService.request_password_reset(email)
        if user and token:
            EmailService.send_password_reset_email(user.email, user.first_name, token)
        response = {"message": "Si l'email existe, un lien de réinitialisation a été envoyé."}
        if not EmailService.is_enabled() and token and current_app.debug:
            response["token"] = token
        return response, 200


@auth_ns.route("/resend-verification")
class ResendVerification(Resource):
    def post(self):
        email = auth_ns.payload.get("email")
        user = User.query.filter_by(email=email, deleted_at=None).first()
        if not user or user.is_verified:
            return {"message": "Si l'email existe, un nouveau lien a été envoyé."}, 200

        user.email_verification_token = str(uuid.uuid4())
        db.session.commit()

        email_sent = EmailService.send_verification_email(
            user.email, user.first_name, user.email_verification_token
        )
        response = {
            "message": (
                "Un nouvel email de confirmation a été envoyé."
                if email_sent
                else "SMTP non configuré. Consultez les logs du serveur."
            ),
            "email_sent": email_sent,
        }
        if not email_sent and current_app.debug:
            response["verification_token"] = user.email_verification_token
        return response, 200


@auth_ns.route("/reset-password")
class ResetPassword(Resource):
    def post(self):
        try:
            AuthService.reset_password(
                auth_ns.payload["token"],
                auth_ns.payload["password"],
            )
            return {"message": "Mot de passe réinitialisé avec succès"}, 200
        except ValueError as e:
            return {"message": str(e)}, 400


@auth_ns.route("/verify-email/<string:token>")
class VerifyEmail(Resource):
    def get(self, token):
        try:
            AuthService.verify_email(token)
            return {"message": "Email vérifié avec succès"}, 200
        except ValueError as e:
            return {"message": str(e)}, 400


def _verification_html(title: str, message: str, login_url: str, success: bool) -> str:
    color = "#16a34a" if success else "#dc2626"
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — Adoul Portail</title>
  <style>
    body {{ font-family: system-ui, sans-serif; background: #fafafa; margin: 0; padding: 2rem; }}
    .card {{ max-width: 420px; margin: 4rem auto; background: #fff; border: 1px solid #e5e7eb;
      border-radius: 1rem; padding: 2rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.08); }}
    h1 {{ color: {color}; font-size: 1.25rem; margin: 0 0 .75rem; }}
    p {{ color: #475569; font-size: .95rem; line-height: 1.5; }}
    a {{ display: inline-block; margin-top: 1.5rem; padding: .75rem 1.5rem; background: #2563eb;
      color: #fff; text-decoration: none; border-radius: 9999px; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>{title}</h1>
    <p>{message}</p>
    <a href="{login_url}">Se connecter / دخول</a>
  </div>
</body>
</html>"""


@auth_ns.route("/verify-email/<string:token>/activate")
class VerifyEmailActivate(Resource):
    """Lien cliqué depuis l'email — vérifie via le backend (port 5001), sans dépendre du frontend."""
    def get(self, token):
        locale = current_app.config.get("DEFAULT_LOCALE", "fr")
        login_url = f"{current_app.config['FRONTEND_URL'].rstrip('/')}/{locale}/login?verified=1"
        try:
            AuthService.verify_email(token)
            html = _verification_html(
                "Compte activé",
                "Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter.",
                login_url,
                success=True,
            )
            return make_response(html, 200)
        except ValueError as e:
            html = _verification_html(
                "Échec de la vérification",
                str(e),
                login_url.replace("?verified=1", ""),
                success=False,
            )
            return make_response(html, 400)
