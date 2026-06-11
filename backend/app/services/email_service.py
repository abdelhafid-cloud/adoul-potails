import logging

from flask import current_app
from flask_mail import Message

from app.extensions import mail

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def is_enabled() -> bool:
        return bool(
            current_app.config.get("MAIL_USERNAME")
            and current_app.config.get("MAIL_PASSWORD")
        )

    @staticmethod
    def _verification_url(token: str) -> str:
        api_base = current_app.config.get("API_PUBLIC_URL", "http://localhost:5001").rstrip("/")
        return f"{api_base}/api/v1/auth/verify-email/{token}/activate"

    @staticmethod
    def send_verification_email(to_email: str, first_name: str, token: str) -> bool:
        verify_url = EmailService._verification_url(token)
        subject = "Adoul AI — Confirmez votre adresse email"
        body = f"""Bonjour {first_name},

Merci pour votre inscription sur Adoul AI.

Cliquez sur le lien ci-dessous pour activer votre compte :
{verify_url}

Ce lien est valable 24 heures.

Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.

L'équipe Adoul AI
"""
        html = f"""<p>Bonjour <strong>{first_name}</strong>,</p>
<p>Merci pour votre inscription sur <strong>Adoul AI</strong>.</p>
<p><a href="{verify_url}" style="color:#EF8354;">Activer mon compte</a></p>
<p>Ou copiez ce lien :<br><code>{verify_url}</code></p>
<p>L'équipe Adoul AI</p>"""

        return EmailService._send(to_email, subject, body, html, verify_url)

    @staticmethod
    def send_password_reset_email(to_email: str, first_name: str, token: str) -> bool:
        base = current_app.config["FRONTEND_URL"].rstrip("/")
        locale = current_app.config.get("DEFAULT_LOCALE", "fr")
        reset_url = f"{base}/{locale}/reset-password?token={token}"
        subject = "Adoul AI — Réinitialisation du mot de passe"
        body = f"""Bonjour {first_name},

Pour réinitialiser votre mot de passe, cliquez sur le lien :
{reset_url}

Ce lien expire dans 24 heures.

L'équipe Adoul AI
"""
        html = f"""<p>Bonjour <strong>{first_name}</strong>,</p>
<p><a href="{reset_url}" style="color:#EF8354;">Réinitialiser mon mot de passe</a></p>
<p>Ou copiez ce lien :<br><code>{reset_url}</code></p>"""

        return EmailService._send(to_email, subject, body, html, reset_url)

    @staticmethod
    def _send(
        to_email: str,
        subject: str,
        body: str,
        html: str,
        log_url: str | None = None,
    ) -> bool:
        if not EmailService.is_enabled():
            logger.warning(
                "SMTP non configuré — email non envoyé à %s. Lien : %s",
                to_email,
                log_url or "(aucun)",
            )
            return False

        msg = Message(
            subject=subject,
            recipients=[to_email],
            body=body,
            html=html,
        )
        try:
            mail.send(msg)
            logger.info("Email envoyé à %s — sujet : %s", to_email, subject)
            return True
        except Exception:
            logger.exception("Échec envoi email à %s", to_email)
            return False
