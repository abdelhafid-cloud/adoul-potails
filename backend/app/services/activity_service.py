"""Sérialisation des logs d'activité — cabinet et plateforme."""

from app.models import (
    ActCalculation,
    AuditLog,
    Client,
    Dossier,
    InheritanceCalculation,
    User,
    Cabinet,
)


def serialize_activity(log: AuditLog, include_cabinet: bool = False) -> dict:
    ctx_fr, ctx_ar, link = _activity_context(log)
    payload = {
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": str(log.entity_id) if log.entity_id else None,
        "created_at": log.created_at.isoformat() if log.created_at else None,
        "user_id": str(log.user_id) if log.user_id else None,
        "user_name": log.user.full_name if log.user else None,
        "user_email": log.user.email if log.user else None,
        "context_fr": ctx_fr,
        "context_ar": ctx_ar,
        "link": link,
    }
    if include_cabinet:
        cab = None
        if log.cabinet_id:
            cab = Cabinet.query.filter_by(id=log.cabinet_id, deleted_at=None).first()
        if not cab and log.user and log.user.cabinet:
            cab = log.user.cabinet
        if cab:
            payload["cabinet_id"] = str(cab.id)
            payload["cabinet_name"] = cab.name
            payload["cabinet_city"] = cab.city
    elif log.cabinet_id:
        payload["cabinet_id"] = str(log.cabinet_id)
    return payload


def _activity_context(log: AuditLog) -> tuple[str | None, str | None, str | None]:
    eid = log.entity_id
    etype = log.entity_type

    if log.action == "create_dossier" and eid:
        d = Dossier.query.filter_by(id=eid, deleted_at=None).first()
        if d:
            name = d.client.full_name if d.client else (d.title or d.number)
            return f"Dossier {d.number} — {name}", f"ملف {d.number} — {name}", "dossier"

    if log.action == "create_client" and eid:
        c = Client.query.filter_by(id=eid, deleted_at=None).first()
        if c:
            return c.full_name, c.full_name, None

    if log.action == "inheritance_calculation" and eid:
        calc = InheritanceCalculation.query.filter_by(id=eid, deleted_at=None).first()
        if calc:
            dossier_ref = f" ({calc.dossier.number})" if calc.dossier else ""
            title = calc.title or "Calcul d'héritage"
            return f"{title}{dossier_ref}", f"{title}{dossier_ref}", "inheritance"

    if log.action == "act_calculation" and eid:
        calc = ActCalculation.query.filter_by(id=eid, deleted_at=None).first()
        if calc:
            dossier_ref = f" ({calc.dossier.number})" if calc.dossier else ""
            return f"{calc.title or etype}{dossier_ref}", f"{calc.title or etype}{dossier_ref}", "act"

    if log.action == "export_pdf" and etype:
        type_labels = {
            "inheritance": ("PDF héritage", "PDF الميراث"),
            "property_share": ("PDF partage immobilier", "PDF تقسيم العقار"),
            "sale": ("PDF vente", "PDF البيع"),
            "wasiyyah": ("PDF wasiyyah", "PDF الوصية"),
            "marriage": ("PDF mariage", "PDF الزواج"),
            "donation": ("PDF donation", "PDF الهبة"),
            "procuration": ("PDF procuration", "PDF الوكالة"),
        }
        if etype in type_labels:
            fr, ar = type_labels[etype]
            return fr, ar, etype if etype in ("inheritance", "property_share") else "act"

    if etype == "dossier" and eid:
        d = Dossier.query.filter_by(id=eid, deleted_at=None).first()
        if d:
            return d.number, d.number, "dossier"

    return None, None, None
