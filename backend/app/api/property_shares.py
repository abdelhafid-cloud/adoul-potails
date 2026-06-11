from flask_restx import Namespace, Resource, fields
from app.middleware.auth import jwt_required_custom
from app.extensions import db
from app.models import PropertyShare, AuditLog, Dossier
from app.services.property_share_service import PropertyShareService
from app.services.dossier_service import DossierService
from app.services.pdf_service import PDFService
from app.utils.pdf_response import pdf_response

property_ns = Namespace("property-shares", description="Partage immobilier")

share_model = property_ns.model("PropertyShare", {
    "title": fields.String,
    "total_value": fields.Float,
    "properties": fields.List(fields.Raw, required=True),
    "heirs": fields.List(fields.Raw, required=True),
    "dossier_id": fields.String(required=True),
    "notes": fields.String,
})


def serialize_share(s: PropertyShare) -> dict:
    payload = {
        "id": str(s.id),
        "title": s.title,
        "total_value": float(s.total_value),
        "properties": s.properties,
        "heirs": s.heirs,
        "distribution": s.distribution,
        "soultes": s.soultes,
        "dossier_id": str(s.dossier_id) if s.dossier_id else None,
        "notes": s.notes,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }
    if s.dossier:
        payload["dossier"] = {"id": str(s.dossier.id), "number": s.dossier.number, "title": s.dossier.title}
        if s.dossier.client:
            payload["client"] = {"id": str(s.dossier.client.id), "full_name": s.dossier.client.full_name}
    return payload


@property_ns.route("/calculate")
class CalculatePropertyShare(Resource):
    @jwt_required_custom
    @property_ns.expect(share_model)
    def post(self, user):
        data = property_ns.payload
        dossier_id = data.get("dossier_id")
        if not dossier_id:
            return {"message": "Un dossier est requis pour enregistrer le calcul."}, 400

        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first()
        if not dossier:
            return {"message": "Dossier introuvable."}, 404

        try:
            result = PropertyShareService.calculate(data)
        except ValueError as e:
            return {"message": str(e)}, 400

        share = PropertyShare(
            title=data.get("title") or f"Partage — {dossier.number}",
            total_value=result["total_value"],
            properties=result["properties"],
            heirs=result["heirs"],
            distribution=result["distribution"],
            soultes=result["soultes"],
            dossier_id=dossier.id,
            cabinet_id=user.cabinet_id,
            created_by=user.id,
            notes=data.get("notes"),
        )
        db.session.add(share)
        if dossier.status == Dossier.STATUS_DRAFT:
            dossier.status = Dossier.STATUS_IN_PROGRESS
        db.session.commit()
        return serialize_share(share), 201


@property_ns.route("")
class PropertyShareList(Resource):
    @jwt_required_custom
    def get(self, user):
        shares = PropertyShare.query.filter_by(
            cabinet_id=user.cabinet_id, deleted_at=None
        ).order_by(PropertyShare.created_at.desc()).limit(50).all()
        return [serialize_share(s) for s in shares], 200


@property_ns.route("/<string:share_id>")
class PropertyShareDetail(Resource):
    @jwt_required_custom
    def get(self, user, share_id):
        share = PropertyShare.query.filter_by(
            id=share_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        return serialize_share(share), 200


@property_ns.route("/<string:share_id>/pdf")
class PropertySharePDF(Resource):
    @jwt_required_custom
    def get(self, user, share_id):
        share = PropertyShare.query.filter_by(
            id=share_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        cabinet_name = user.cabinet.name if user.cabinet else "Cabinet Adoul"
        try:
            pdf_bytes = PDFService.generate_property_share_report(
                serialize_share(share), cabinet_name
            )
        except Exception as exc:
            return {"message": f"Erreur génération PDF: {exc}"}, 500
        db.session.add(AuditLog(
            action="export_pdf", entity_type="property_share",
            entity_id=share.id, user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        DossierService.mark_completed_on_pdf_export(share.dossier)
        db.session.commit()
        return pdf_response(pdf_bytes, f"partage_{share_id}.pdf")
