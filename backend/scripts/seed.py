"""Seed initial data for development."""
import argparse
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db
from app.models import Role, User


def promote_super_admin(email: str) -> None:
    app = create_app()
    with app.app_context():
        for role_data in Role.DEFAULT_ROLES:
            if not Role.query.filter_by(name=role_data["name"]).first():
                db.session.add(Role(**role_data))
        db.session.commit()

        super_role = Role.query.filter_by(name=Role.SUPER_ADMIN).first()
        user = User.query.filter_by(email=email.strip().lower(), deleted_at=None).first()
        if not user:
            raise SystemExit(f"Utilisateur introuvable : {email}")
        user.role_id = super_role.id
        user.is_verified = True
        user.is_active = True
        db.session.commit()
        print(f"Super admin activé pour {user.email}")


def seed():
    app = create_app()
    with app.app_context():
        for role_data in Role.DEFAULT_ROLES:
            if not Role.query.filter_by(name=role_data["name"]).first():
                db.session.add(Role(**role_data))
        db.session.commit()

        super_role = Role.query.filter_by(name=Role.SUPER_ADMIN).first()
        if super_role and not User.query.filter_by(email="admin@adoul-ai.ma").first():
            admin = User(
                email="admin@adoul-ai.ma",
                first_name="Super",
                last_name="Admin",
                role_id=super_role.id,
                is_verified=True,
                is_active=True,
            )
            admin.set_password("Admin123!")
            db.session.add(admin)
            db.session.commit()
            print("Super admin créé: admin@adoul-ai.ma / Admin123!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed / promotion super admin")
    parser.add_argument("--promote", metavar="EMAIL", help="Promouvoir un utilisateur en super admin")
    args = parser.parse_args()
    if args.promote:
        promote_super_admin(args.promote)
    else:
        seed()
