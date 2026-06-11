from flask import request
from flask_restx import Namespace, Resource, fields
from app.middleware.auth import jwt_required_custom
from app.extensions import db
from app.models import ActCalculation, Dossier, AuditLog
from app.services.act_calculation_service import ActCalculationService
from app.services.dossier_service import DossierService
from app.services.pdf_service import PDFService
from app.utils.pdf_response import pdf_response

act_ns = Namespace("act-calculations", description="Calculs vente, donation, procuration")

VALID_TYPES = {"sale", "donation", "procuration", "marriage", "wasiyyah", "other"}

calc_model = act_ns.model("ActCalculation", {
    "type": fields.String(required=True),
    "title": fields.String,
    "dossier_id": fields.String(required=True),
    "notes": fields.String,
})


def serialize_act(c: ActCalculation) -> dict:
    payload = {
        "id": str(c.id),
        "type": c.type,
        "title": c.title,
        "inputs": c.inputs,
        "results": c.results,
        "legal_proof": c.legal_proof or {},
        "total_amount": float(c.total_amount or 0),
        "dossier_id": str(c.dossier_id) if c.dossier_id else None,
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
    if c.dossier:
        payload["dossier"] = {"id": str(c.dossier.id), "number": c.dossier.number, "title": c.dossier.title}
        if c.dossier.client:
            payload["client"] = {"id": str(c.dossier.client.id), "full_name": c.dossier.client.full_name}
    return payload


@act_ns.route("/calculate")
class CalculateAct(Resource):
    @jwt_required_custom
    def post(self, user):
        data = act_ns.payload or {}
        act_type = data.get("type")
        if act_type not in VALID_TYPES:
            return {"message": f"Type invalide. Types acceptés: {', '.join(VALID_TYPES)}"}, 400

        dossier_id = data.get("dossier_id")
        if not dossier_id:
            return {"message": "Un dossier est requis."}, 400

        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first()
        if not dossier:
            return {"message": "Dossier introuvable."}, 404

        try:
            result = ActCalculationService.calculate(act_type, data)
        except ValueError as e:
            return {"message": str(e)}, 400

        calc = ActCalculation(
            type=act_type,
            title=data.get("title") or f"Calcul — {dossier.number}",
            inputs=result["inputs"],
            results=result["results"],
            legal_proof=result["legal_proof"],
            total_amount=result["total_amount"],
            dossier_id=dossier.id,
            cabinet_id=user.cabinet_id,
            created_by=user.id,
            notes=data.get("notes"),
        )
        db.session.add(calc)
        db.session.flush()
        db.session.add(AuditLog(
            action="act_calculation", entity_type=act_type,
            entity_id=calc.id, user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        if dossier.status == Dossier.STATUS_DRAFT:
            dossier.status = Dossier.STATUS_IN_PROGRESS
        db.session.commit()
        return serialize_act(calc), 201


@act_ns.route("")
class ActCalculationList(Resource):
    @jwt_required_custom
    def get(self, user):
        dossier_id = request.args.get("dossier_id")
        act_type = request.args.get("type")
        query = ActCalculation.query.filter_by(cabinet_id=user.cabinet_id, deleted_at=None)
        if dossier_id:
            query = query.filter_by(dossier_id=dossier_id)
        if act_type:
            query = query.filter_by(type=act_type)
        calcs = query.order_by(ActCalculation.created_at.desc()).limit(50).all()
        return [serialize_act(c) for c in calcs], 200


@act_ns.route("/<string:calc_id>")
class ActCalculationDetail(Resource):
    @jwt_required_custom
    def get(self, user, calc_id):
        calc = ActCalculation.query.filter_by(
            id=calc_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        return serialize_act(calc), 200


@act_ns.route("/<string:calc_id>/pdf")
class ActCalculationPDF(Resource):
    @jwt_required_custom
    def get(self, user, calc_id):
        calc = ActCalculation.query.filter_by(
            id=calc_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        cabinet_name = user.cabinet.name if user.cabinet else "Cabinet Adoul"
        try:
            pdf_bytes = PDFService.generate_act_report(serialize_act(calc), cabinet_name)
        except Exception as exc:
            return {"message": f"Erreur génération PDF: {exc}"}, 500
        db.session.add(AuditLog(
            action="export_pdf", entity_type=calc.type,
            entity_id=calc.id, user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        DossierService.mark_completed_on_pdf_export(calc.dossier)
        db.session.commit()
        return pdf_response(pdf_bytes, f"{calc.type}_{calc_id}.pdf")
