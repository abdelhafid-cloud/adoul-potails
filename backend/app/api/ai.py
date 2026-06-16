from flask import Response
from flask_restx import Namespace, Resource
import json
from pathlib import Path

from app.extensions import db
from app.middleware.auth import jwt_required_custom
from app.models import AIConversation
from app.services.ai_service import AIService
from app.services.flowise_service import FlowiseService
from app.services.ocr_service import OCRService

ai_ns = Namespace("ai", description="Assistant IA")
ocr_ns = Namespace("ocr", description="OCR documents")

_QA_PATH = Path(__file__).resolve().parent.parent / "data" / "assistant_qa.json"


@ai_ns.route("/assistant/status")
class AssistantStatus(Resource):
    @jwt_required_custom
    def get(self, user):
        return {
            "flowise_configured": FlowiseService.is_configured(),
            "provider": "flowise" if FlowiseService.is_configured() else "openai",
        }, 200


@ai_ns.route("/assistant/qa")
class AssistantQA(Resource):
    @jwt_required_custom
    def get(self, user):
        if not _QA_PATH.is_file():
            return {"message": "Fichier Q&A introuvable."}, 404
        with open(_QA_PATH, encoding="utf-8") as f:
            return json.load(f), 200


@ai_ns.route("/conversations")
class ConversationList(Resource):
    @jwt_required_custom
    def get(self, user):
        convs = AIConversation.query.filter_by(
            user_id=user.id, deleted_at=None,
        ).order_by(AIConversation.updated_at.desc()).all()
        return [AIService.serialize_conversation(c) for c in convs], 200

    @jwt_required_custom
    def post(self, user):
        data = ai_ns.payload or {}
        conv = AIService.create_conversation(
            user.id,
            user.cabinet_id,
            title=data.get("title"),
            dossier_id=data.get("dossier_id"),
        )
        return AIService.serialize_conversation(conv), 201


@ai_ns.route("/conversations/<string:conv_id>")
class ConversationDetail(Resource):
    @jwt_required_custom
    def patch(self, user, conv_id):
        data = ai_ns.payload or {}
        title = (data.get("title") or "").strip()
        if not title:
            return {"message": "Titre requis."}, 400
        conv = AIService.rename_conversation(conv_id, user.id, title)
        if not conv:
            return {"message": "Conversation introuvable."}, 404
        return AIService.serialize_conversation(conv), 200

    @jwt_required_custom
    def delete(self, user, conv_id):
        if not AIService.delete_conversation(conv_id, user.id):
            return {"message": "Conversation introuvable."}, 404
        return {"message": "Conversation supprimée."}, 200


@ai_ns.route("/conversations/<string:conv_id>/messages")
class ConversationMessages(Resource):
    @jwt_required_custom
    def get(self, user, conv_id):
        conv = AIConversation.query.filter_by(
            id=conv_id, user_id=user.id, deleted_at=None,
        ).first_or_404()
        return [{
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
            "provider": (m.extra_data or {}).get("provider"),
        } for m in conv.messages if m.role in ("user", "assistant")], 200

    @jwt_required_custom
    def post(self, user, conv_id):
        message = (ai_ns.payload or {}).get("message", "").strip()
        if not message:
            return {"message": "Message requis"}, 400

        def generate():
            try:
                for chunk in AIService.chat(conv_id, message, user.id):
                    yield f"data: {json.dumps({'token': chunk}, ensure_ascii=False)}\n\n"
            except ValueError as exc:
                yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return Response(generate(), mimetype="text/event-stream")


@ocr_ns.route("/extract")
class OCRExtract(Resource):
    @jwt_required_custom
    def post(self, user):
        from flask import request
        if "file" not in request.files:
            return {"message": "Fichier requis"}, 400
        file = request.files["file"]
        try:
            filepath = OCRService.save_upload(file)
            result = OCRService.extract_text(filepath)
            return {"filepath": filepath, **result}, 200
        except ValueError as e:
            return {"message": str(e)}, 400
