"""Génère des clients et dossiers de démonstration pour un cabinet.

Usage (depuis backend/) :
    python scripts/seed_clients_dossiers.py
    python scripts/seed_clients_dossiers.py --count 100
    python scripts/seed_clients_dossiers.py --email adoul@example.com --count 50
"""
from __future__ import annotations

import argparse
import os
import random
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.constants.moroccan_cities import MOROCCAN_CITIES
from app.extensions import db
from app.models import Cabinet, Client, Dossier, User

FIRST_NAMES_M = [
    "Mohamed", "Ahmed", "Youssef", "Hassan", "Omar", "Karim", "Rachid", "Said",
    "Abdelilah", "Mustapha", "Hamza", "Mehdi", "Khalid", "Nabil", "Tarik",
]
FIRST_NAMES_F = [
    "Fatima", "Aicha", "Khadija", "Sanae", "Nadia", "Salma", "Imane", "Houda",
    "Latifa", "Zineb", "Meriem", "Soukaina", "Hafsa", "Rajae", "Samira",
]
LAST_NAMES = [
    "Alaoui", "Benjelloun", "Chraibi", "El Fassi", "Idrissi", "Kettani",
    "Lahlou", "Mansouri", "Ouazzani", "Rahmani", "Tazi", "Ziani", "Bennani",
    "Filali", "Amrani", "Berrada", "Cherkaoui", "Hajji", "Sefrioui", "Touimi",
]

PROFESSIONS = [
    "Commerçant", "Fonctionnaire", "Médecin", "Enseignant", "Artisan",
    "Ingénieur", "Agriculteur", "Retraité", "Avocat", "Infirmier",
]

DOSSIER_TYPES = [
    (Dossier.TYPE_HERITAGE, 0.55),
    (Dossier.TYPE_PROPERTY_SHARE, 0.12),
    (Dossier.TYPE_SALE, 0.10),
    (Dossier.TYPE_MARRIAGE, 0.08),
    (Dossier.TYPE_DONATION, 0.07),
    (Dossier.TYPE_PROCURATION, 0.05),
    (Dossier.TYPE_OTHER, 0.03),
]

STATUSES = [
    (Dossier.STATUS_DRAFT, 0.15),
    (Dossier.STATUS_IN_PROGRESS, 0.35),
    (Dossier.STATUS_PENDING, 0.15),
    (Dossier.STATUS_COMPLETED, 0.30),
    (Dossier.STATUS_ARCHIVED, 0.05),
]

TYPE_TITLES = {
    Dossier.TYPE_HERITAGE: ("Succession", "تركة"),
    Dossier.TYPE_PROPERTY_SHARE: ("Partage immobilier", "تقسيم عقار"),
    Dossier.TYPE_SALE: ("Vente immobilière", "بيع عقاري"),
    Dossier.TYPE_MARRIAGE: ("Contrat de mariage", "عقد زواج"),
    Dossier.TYPE_DONATION: ("Donation", "هبة"),
    Dossier.TYPE_PROCURATION: ("Procuration", "وكالة"),
    Dossier.TYPE_OTHER: ("Dossier divers", "ملف متنوع"),
}


def _pick_weighted(options: list[tuple[str, float]]) -> str:
    values, weights = zip(*options)
    return random.choices(values, weights=weights, k=1)[0]


def _generate_cin(index: int) -> str:
    letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    return f"{letters[index % len(letters)]}{letters[(index // 26) % len(letters)]}{100000 + index:06d}"


def _generate_phone(index: int) -> str:
    prefixes = ["06", "07", "05"]
    return f"{random.choice(prefixes)}{index:08d}"[-10:]


def _dossier_number(cabinet_id, offset: int) -> str:
    count = Dossier.query.filter_by(cabinet_id=cabinet_id).count() + offset
    year = datetime.now().year
    return f"DOS-{year}-{count:05d}"


def _resolve_cabinet_context(email: str | None) -> tuple[Cabinet, User]:
    query = User.query.filter_by(deleted_at=None)
    if email:
        user = query.filter_by(email=email.strip().lower()).first()
        if not user:
            raise SystemExit(f"Utilisateur introuvable : {email}")
    else:
        user = query.filter(User.cabinet_id.isnot(None)).first()
        if not user:
            raise SystemExit(
                "Aucun utilisateur avec cabinet trouvé. "
                "Créez un compte cabinet ou passez --email."
            )

    if not user.cabinet_id:
        raise SystemExit(f"L'utilisateur {user.email} n'est rattaché à aucun cabinet.")

    cabinet = db.session.get(Cabinet, user.cabinet_id)
    if not cabinet:
        raise SystemExit("Cabinet introuvable.")

    return cabinet, user


def seed_clients_and_dossiers(count: int, email: str | None, dry_run: bool) -> None:
    app = create_app()
    with app.app_context():
        cabinet, user = _resolve_cabinet_context(email)
        cities = [c["fr"] for c in MOROCCAN_CITIES]

        print(f"Cabinet : {cabinet.name}")
        print(f"Utilisateur : {user.full_name} ({user.email})")
        print(f"Génération : {count} client(s) + {count} dossier(s)")
        if dry_run:
            print("Mode dry-run — aucune écriture en base.")
            return

        created_clients = 0
        created_dossiers = 0
        base_index = Client.query.filter_by(cabinet_id=cabinet.id, deleted_at=None).count()

        for i in range(count):
            idx = base_index + i + 1
            is_female = random.random() < 0.45
            first = random.choice(FIRST_NAMES_F if is_female else FIRST_NAMES_M)
            last = random.choice(LAST_NAMES)
            city = random.choice(cities)

            client = Client(
                first_name=first,
                last_name=last,
                cin=_generate_cin(idx),
                phone=_generate_phone(idx),
                email=f"client{idx}@demo.adoulportail.ma",
                address=f"{random.randint(1, 180)} Bd Mohammed V, {city}",
                profession=random.choice(PROFESSIONS),
                notes="Client généré automatiquement (données de démonstration).",
                cabinet_id=cabinet.id,
                created_by=user.id,
            )
            db.session.add(client)
            db.session.flush()

            dossier_type = _pick_weighted(DOSSIER_TYPES)
            status = _pick_weighted(STATUSES)
            title_fr, title_ar = TYPE_TITLES[dossier_type]

            dossier = Dossier(
                number=_dossier_number(cabinet.id, i + 1),
                title=f"{title_fr} — {client.full_name}",
                type=dossier_type,
                status=status,
                description=f"Dossier démo ({title_fr} / {title_ar}) pour {client.full_name}.",
                client_id=client.id,
                cabinet_id=cabinet.id,
                responsible_id=user.id,
                created_by=user.id,
            )
            db.session.add(dossier)
            created_clients += 1
            created_dossiers += 1

            if (i + 1) % 25 == 0:
                db.session.commit()
                print(f"  … {i + 1}/{count} enregistrés")

        db.session.commit()
        print(f"Terminé : {created_clients} clients et {created_dossiers} dossiers créés.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Génère N clients avec N dossiers (1 dossier par client).",
    )
    parser.add_argument(
        "--count", type=int, default=100,
        help="Nombre de clients/dossiers à créer (défaut : 100).",
    )
    parser.add_argument(
        "--email", type=str, default=None,
        help="Email de l'utilisateur dont le cabinet recevra les données.",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Affiche le contexte sans écrire en base.",
    )
    args = parser.parse_args()

    if args.count < 1:
        raise SystemExit("--count doit être >= 1")

    seed_clients_and_dossiers(args.count, args.email, args.dry_run)


if __name__ == "__main__":
    main()
