from flask_restx import Namespace, Resource, fields
from sqlalchemy import or_
from app.middleware.auth import jwt_required_custom, permission_required
from app.extensions import db
from app.models import Client, AuditLog

clients_ns = Namespace("clients", description="Gestion des clients")

client_model = clients_ns.model("Client", {
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "cin": fields.String(required=True),
    "phone": fields.String,
    "email": fields.String,
    "address": fields.String,
    "profession": fields.String,
    "notes": fields.String,
})


def serialize_client(c: Client) -> dict:
    return {
        "id": str(c.id),
        "first_name": c.first_name,
        "last_name": c.last_name,
        "full_name": c.full_name,
        "cin": c.cin,
        "phone": c.phone,
        "email": c.email,
        "address": c.address,
        "profession": c.profession,
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@clients_ns.route("")
class ClientList(Resource):
    @jwt_required_custom
    def get(self, user):
        page = int(clients_ns.payload or 0) if False else int(
            __import__("flask").request.args.get("page", 1)
        )
        per_page = int(__import__("flask").request.args.get("per_page", 20))
        search = __import__("flask").request.args.get("search", "")

        query = Client.query.filter_by(
            cabinet_id=user.cabinet_id, deleted_at=None
        )
        if search:
            term = f"%{search}%"
            query = query.filter(or_(
                Client.first_name.ilike(term),
                Client.last_name.ilike(term),
                Client.cin.ilike(term),
            ))

        pagination = query.order_by(Client.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return {
            "items": [serialize_client(c) for c in pagination.items],
            "total": pagination.total,
            "page": page,
            "pages": pagination.pages,
        }, 200

    @jwt_required_custom
    @clients_ns.expect(client_model)
    def post(self, user):
        data = clients_ns.payload
        client = Client(
            **{k: data.get(k) for k in ["first_name", "last_name", "cin", "phone",
                                         "email", "address", "profession", "notes"]},
            cabinet_id=user.cabinet_id,
            created_by=user.id,
        )
        db.session.add(client)
        db.session.flush()
        db.session.add(AuditLog(
            action="create_client", entity_type="client", entity_id=client.id,
            user_id=user.id, cabinet_id=user.cabinet_id,
        ))
        db.session.commit()
        return serialize_client(client), 201


@clients_ns.route("/<string:client_id>")
class ClientDetail(Resource):
    @jwt_required_custom
    def get(self, user, client_id):
        client = Client.query.filter_by(
            id=client_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        return serialize_client(client), 200

    @jwt_required_custom
    @clients_ns.expect(client_model)
    def put(self, user, client_id):
        client = Client.query.filter_by(
            id=client_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        data = clients_ns.payload
        for field in ["first_name", "last_name", "cin", "phone", "email", "address", "profession", "notes"]:
            if field in data:
                setattr(client, field, data[field])
        db.session.commit()
        return serialize_client(client), 200

    @jwt_required_custom
    def delete(self, user, client_id):
        client = Client.query.filter_by(
            id=client_id, cabinet_id=user.cabinet_id, deleted_at=None
        ).first_or_404()
        client.soft_delete()
        db.session.commit()
        return {"message": "Client supprimé"}, 200
