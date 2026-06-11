from flask import request
from flask_restx import Namespace, Resource, fields
from sqlalchemy import or_
from app.middleware.auth import jwt_required_custom
from app.extensions import db
from app.models import Dossier, Client, AuditLog, InheritanceCalculation, PropertyShare, ActCalculation, Document
from app.services.upload_service import UploadService

dossiers_ns = Namespace("dossiers", description="Gestion des dossiers")

dossier_model = dossiers_ns.model("Dossier", {
    "title": fields.String,
    "type": fields.String(required=True),
    "status": fields.String,
    "description": fields.String,
    "client_id": fields.String(required=True),
    "responsible_id": fields.String,
})


def serialize_document(doc: Document) -> dict:
    return {
        "id": str(doc.id),
        "name": doc.name,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "file_url": UploadService.public_url(doc.file_path),
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


def serialize_dossier(d: Dossier) -> dict:
    return {
        "id": str(d.id),
        "number": d.number,
        "title": d.title,
        "type": d.type,
        "status": d.status,
        "description": d.description,
        "client_id": str(d.client_id),
        "client_name": d.client.full_name if d.client else None,
        "responsible_id": str(d.responsible_id) if d.responsible_id else None,
        "responsible_name": d.responsible.full_name if d.responsible else None,
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    }


def generate_dossier_number(cabinet_id) -> str:
    count = Dossier.query.filter_by(cabinet_id=cabinet_id).count()
    from datetime import datetime
    year = datetime.now().year
    return f"DOS-{year}-{count + 1:05d}"


@dossiers_ns.route("")
class DossierList(Resource):
    @jwt_required_custom
    def get(self, user):
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        search = request.args.get("search", "")
        status = request.args.get("status")
        dossier_type = request.args.get("type")

        query = Dossier.query.filter_by(cabinet_id=user.cabinet_id, deleted_at=None)
        if search:
            term = f"%{search}%"
            query = query.filter(or_(Dossier.number.ilike(term), Dossier.title.ilike(term)))
        if status:
            query = query.filter_by(status=status)
        if dossier_type:
            query = query.filter_by(type=dossier_type)

        pagination = query.order_by(Dossier.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return {
            "items": [serialize_dossier(d) for d in pagination.items],
            "total": pagination.total,
            "page": page,
            "pages": pagination.pages,
        }, 200

    @jwt_required_custom
    @dossiers_ns.expect(dossier_model)
    def post(self, user):
        data = dossiers_ns.payload
        client = Client.query.filter_by(
            id=data["client_id"], cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()

        dossier = Dossier(
            number=generate_dossier_number(user.cabinet_id),
            title=data.get("title") or f"Dossier {client.full_name}",
            type=data["type"],
            status=data.get("status", Dossier.STATUS_DRAFT),
            description=data.get("description"),
            client_id=client.id,
            cabinet_id=user.cabinet_id,
            responsible_id=data.get("responsible_id") or user.id,
            created_by=user.id,
        )
        db.session.add(dossier)
        db.session.flush()
        db.session.add(AuditLog(
            action="create_dossier", entity_type="dossier", entity_id=dossier.id,
            user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        db.session.commit()
        return serialize_dossier(dossier), 201


@dossiers_ns.route("/<string:dossier_id>")
class DossierDetail(Resource):
    @jwt_required_custom
    def get(self, user, dossier_id):
        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        data = serialize_dossier(dossier)
        calcs = InheritanceCalculation.query.filter_by(
            dossier_id=dossier.id, deleted_at=None
        ).order_by(InheritanceCalculation.created_at.desc()).limit(20).all()
        data["inheritance_calculations"] = [
            {
                "id": str(c.id),
                "type": "inheritance",
                "title": c.title,
                "total_amount": float(c.net_estate_value or 0),
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in calcs
        ]
        shares = PropertyShare.query.filter_by(
            dossier_id=dossier.id, deleted_at=None
        ).order_by(PropertyShare.created_at.desc()).limit(20).all()
        data["property_shares"] = [
            {
                "id": str(s.id),
                "type": "property_share",
                "title": s.title,
                "total_amount": float(s.total_value or 0),
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in shares
        ]
        acts = ActCalculation.query.filter_by(
            dossier_id=dossier.id, deleted_at=None
        ).order_by(ActCalculation.created_at.desc()).limit(20).all()
        data["act_calculations"] = [
            {
                "id": str(a.id),
                "type": a.type,
                "title": a.title,
                "total_amount": float(a.total_amount or 0),
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in acts
        ]
        data["calculations"] = (
            data["inheritance_calculations"]
            + data["property_shares"]
            + data["act_calculations"]
        )
        data["calculations_count"] = len(data["calculations"])
        docs = Document.query.filter_by(
            dossier_id=dossier.id, deleted_at=None,
        ).order_by(Document.created_at.desc()).all()
        data["documents"] = [serialize_document(doc) for doc in docs]
        data["documents_count"] = len(docs)
        return data, 200

    @jwt_required_custom
    @dossiers_ns.expect(dossier_model)
    def put(self, user, dossier_id):
        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        data = dossiers_ns.payload
        for field in ["title", "type", "status", "description", "responsible_id"]:
            if field in data:
                setattr(dossier, field, data[field])
        db.session.commit()
        return serialize_dossier(dossier), 200

    @jwt_required_custom
    def delete(self, user, dossier_id):
        dossier = Dossier.query.filter_by(
            id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        dossier.soft_delete()
        db.session.commit()
        return {"message": "Dossier archivé"}, 200


def _get_dossier_for_user(user, dossier_id: str) -> Dossier:
    return Dossier.query.filter_by(
        id=dossier_id, cabinet_id=user.cabinet_id, deleted_at=None,
    ).first_or_404()


@dossiers_ns.route("/<string:dossier_id>/documents")
class DossierDocuments(Resource):
    @jwt_required_custom
    def get(self, user, dossier_id):
        dossier = _get_dossier_for_user(user, dossier_id)
        docs = Document.query.filter_by(
            dossier_id=dossier.id, deleted_at=None,
        ).order_by(Document.created_at.desc()).all()
        return {"items": [serialize_document(d) for d in docs]}, 200

    @jwt_required_custom
    def post(self, user, dossier_id):
        dossier = _get_dossier_for_user(user, dossier_id)
        if "file" not in request.files:
            return {"message": "Fichier requis."}, 400

        file = request.files["file"]
        try:
            relative, ext, size = UploadService.save_dossier_document(file, str(dossier.id))
        except ValueError as exc:
            return {"message": str(exc)}, 400

        display_name = (request.form.get("name") or file.filename or "Document").strip()
        doc = Document(
            name=display_name,
            file_path=relative,
            file_type=ext,
            file_size=size,
            dossier_id=dossier.id,
            created_by=user.id,
        )
        db.session.add(doc)
        db.session.add(AuditLog(
            action="upload_document", entity_type="document", entity_id=doc.id,
            user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        db.session.commit()
        return serialize_document(doc), 201


@dossiers_ns.route("/<string:dossier_id>/documents/<string:document_id>")
class DossierDocumentDetail(Resource):
    @jwt_required_custom
    def delete(self, user, dossier_id, document_id):
        dossier = _get_dossier_for_user(user, dossier_id)
        doc = Document.query.filter_by(
            id=document_id, dossier_id=dossier.id, deleted_at=None,
        ).first_or_404()
        UploadService.delete_file(doc.file_path)
        doc.soft_delete()
        db.session.add(AuditLog(
            action="delete_document", entity_type="document", entity_id=doc.id,
            user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        db.session.commit()
        return {"message": "Document supprimé"}, 200
