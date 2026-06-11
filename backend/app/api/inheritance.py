from flask import request
from flask_restx import Namespace, Resource, fields
from sqlalchemy.orm import joinedload
from app.middleware.auth import jwt_required_custom
from app.extensions import db
from app.models import InheritanceCalculation, Dossier, AuditLog
from app.services.inheritance_service import InheritanceService
from app.services.inheritance_verification import build_legal_verification
from app.services.dossier_service import DossierService
from app.services.pdf_service import PDFService
from app.utils.pdf_response import pdf_response

inheritance_ns = Namespace("inheritance", description="Calcul d'héritage")

calculation_model = inheritance_ns.model("InheritanceCalculation", {
    "title": fields.String,
    "total_estate_value": fields.Float(required=True),
    "real_estate_value": fields.Float,
    "bank_accounts_value": fields.Float,
    "debts": fields.Float,
    "fees": fields.Float,
    "heirs": fields.List(fields.Raw, required=True),
    "dossier_id": fields.String(required=True),
    "notes": fields.String,
    "deceased_name": fields.String,
    "deceased_name_ar": fields.String,
    "deceased_cin": fields.String,
    "deceased_death_date": fields.String,
    "deceased_death_place": fields.String,
    "deceased_gender": fields.String,
})


def _faraid_result_for(c: InheritanceCalculation) -> dict:
    from decimal import Decimal
    from app.services.faraid_engine import FaraidEngine
    net = Decimal(str(c.net_estate_value or 0))
    return FaraidEngine.compute(c.heirs or [], net)


def serialize_calculation_summary(c: InheritanceCalculation) -> dict:
    legal = c.legal_proof or {}
    report = legal.get("report") or {}
    deceased = legal.get("deceased") or {}
    return {
        "id": str(c.id),
        "title": c.title,
        "net_estate_value": float(c.net_estate_value or 0),
        "total_estate_value": float(c.total_estate_value or 0),
        "heirs_count": report.get("heirs_count"),
        "excluded_count": report.get("excluded_count"),
        "deceased_name": deceased.get("name_fr") or report.get("deceased_fr"),
        "deceased_name_ar": deceased.get("name_ar") or report.get("deceased_ar"),
        "has_awl": report.get("has_awl", False),
        "has_radd": report.get("has_radd", False),
        "dossier_id": str(c.dossier_id) if c.dossier_id else None,
        "dossier_number": c.dossier.number if c.dossier else None,
        "dossier_title": c.dossier.title if c.dossier else None,
        "client_name": c.dossier.client.full_name if c.dossier and c.dossier.client else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def serialize_calculation(c: InheritanceCalculation) -> dict:
    faraid = _faraid_result_for(c)
    heir_details = faraid.get("heir_details", [])
    excluded_heirs = [d for d in heir_details if d.get("status") in ("blocked", "pending")]
    legal_proof = dict(c.legal_proof or {})
    calc_meta = legal_proof.get("calculation_meta") or faraid.get("calculation_meta", {})
    legal_verification = legal_proof.get("legal_verification") or build_legal_verification(
        c.heirs or [], heir_details, calc_meta, faraid.get("adjustments"),
    )
    if heir_details:
        legal_proof = {
            **legal_proof,
            "legal_verification": legal_verification,
            "heir_proofs": [
                {
                    "type": d.get("type"),
                    "name": d.get("name"),
                    "name_ar": d.get("name_ar"),
                    "amount": d.get("amount"),
                    "percentage": d.get("percentage"),
                    "status": d.get("status", "inherits"),
                    "reason_fr": d.get("reason_fr"),
                    "reason_ar": d.get("reason_ar"),
                    "gender": d.get("gender"),
                    "gender_fr": d.get("gender_fr"),
                    "gender_ar": d.get("gender_ar"),
                    "legal_basis": d.get("legal_basis"),
                }
                for d in heir_details
            ],
            "excluded_heirs": legal_proof.get("excluded_heirs") or [
                {
                    "type": d.get("type"),
                    "name": d.get("name"),
                    "name_ar": d.get("name_ar"),
                    "status": d.get("status"),
                    "reason_fr": d.get("reason_fr"),
                    "reason_ar": d.get("reason_ar"),
                }
                for d in excluded_heirs
            ],
            "adjustments": legal_proof.get("adjustments") or faraid.get("adjustments", []),
            "calculation_meta": legal_proof.get("calculation_meta") or faraid.get("calculation_meta", {}),
        }
    payload = {
        "id": str(c.id),
        "title": c.title,
        "total_estate_value": float(c.total_estate_value),
        "real_estate_value": float(c.real_estate_value or 0),
        "bank_accounts_value": float(c.bank_accounts_value or 0),
        "debts": float(c.debts or 0),
        "fees": float(c.fees or 0),
        "net_estate_value": float(c.net_estate_value or 0),
        "heirs": c.heirs,
        "distribution": c.distribution or faraid.get("distribution", []),
        "heir_details": heir_details,
        "excluded_heirs": excluded_heirs,
        "adjustments": faraid.get("adjustments", []),
        "calculation_meta": faraid.get("calculation_meta", {}),
        "legal_verification": legal_verification,
        "legal_proof": legal_proof,
        "deceased_info": legal_proof.get("deceased") or {},
        "dossier_id": str(c.dossier_id) if c.dossier_id else None,
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
    if c.dossier:
        payload["dossier"] = {
            "id": str(c.dossier.id),
            "number": c.dossier.number,
            "title": c.dossier.title,
            "type": c.dossier.type,
            "status": c.dossier.status,
        }
        if c.dossier.client:
            payload["client"] = {
                "id": str(c.dossier.client.id),
                "full_name": c.dossier.client.full_name,
                "cin": c.dossier.client.cin,
            }
    return payload


@inheritance_ns.route("/calculate")
class CalculateInheritance(Resource):
    @jwt_required_custom
    @inheritance_ns.expect(calculation_model)
    def post(self, user):
        data = inheritance_ns.payload
        dossier_id = data.get("dossier_id")
        if not dossier_id:
            return {"message": "Un dossier est requis pour enregistrer le calcul."}, 400

        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first()
        if not dossier:
            return {"message": "Dossier introuvable."}, 404

        result = InheritanceService.calculate(data)

        calc = InheritanceCalculation(
            title=data.get("title") or f"Héritage — {dossier.number}",
            total_estate_value=result["total_estate_value"],
            real_estate_value=result["real_estate_value"],
            bank_accounts_value=result["bank_accounts_value"],
            debts=result["debts"],
            fees=result["fees"],
            net_estate_value=result["net_estate_value"],
            heirs=result["heirs"],
            distribution=result["distribution"],
            legal_proof=result["legal_proof"],
            dossier_id=dossier.id,
            cabinet_id=user.cabinet_id,
            created_by=user.id,
            notes=data.get("notes"),
        )
        db.session.add(calc)
        db.session.flush()
        db.session.add(AuditLog(
            action="inheritance_calculation", entity_type="inheritance",
            entity_id=calc.id, user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        if dossier.status == Dossier.STATUS_DRAFT:
            dossier.status = Dossier.STATUS_IN_PROGRESS
        db.session.commit()
        return serialize_calculation(calc), 201


@inheritance_ns.route("")
class InheritanceList(Resource):
    @jwt_required_custom
    def get(self, user):
        dossier_id = request.args.get("dossier_id")
        search = (request.args.get("search") or "").strip()
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))

        query = InheritanceCalculation.query.options(
            joinedload(InheritanceCalculation.dossier).joinedload(Dossier.client),
        ).filter_by(cabinet_id=user.cabinet_id, deleted_at=None)
        if dossier_id:
            query = query.filter_by(dossier_id=dossier_id)
        if search:
            term = f"%{search}%"
            query = query.filter(InheritanceCalculation.title.ilike(term))

        pagination = query.order_by(InheritanceCalculation.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False,
        )
        return {
            "items": [serialize_calculation_summary(c) for c in pagination.items],
            "total": pagination.total,
            "page": page,
            "pages": pagination.pages,
        }, 200


@inheritance_ns.route("/<string:calc_id>")
class InheritanceDetail(Resource):
    @jwt_required_custom
    def get(self, user, calc_id):
        calc = InheritanceCalculation.query.filter_by(
            id=calc_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        return serialize_calculation(calc), 200


@inheritance_ns.route("/<string:calc_id>/pdf")
class InheritancePDF(Resource):
    @jwt_required_custom
    def get(self, user, calc_id):
        calc = InheritanceCalculation.query.filter_by(
            id=calc_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        cabinet_name = user.cabinet.name if user.cabinet else "Cabinet Adoul"
        try:
            pdf_bytes = PDFService.generate_inheritance_report(
                serialize_calculation(calc), cabinet_name
            )
        except Exception as exc:
            return {"message": f"Erreur génération PDF: {exc}"}, 500
        db.session.add(AuditLog(
            action="export_pdf", entity_type="inheritance",
            entity_id=calc.id, user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        DossierService.mark_completed_on_pdf_export(calc.dossier)
        db.session.commit()
        return pdf_response(pdf_bytes, f"heritage_{calc_id}.pdf")
