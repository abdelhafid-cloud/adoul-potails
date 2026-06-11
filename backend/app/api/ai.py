from flask import Response
from flask_restx import Namespace, Resource
from app.middleware.auth import jwt_required_custom
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.models import AIConversation, AIMessage

ai_ns = Namespace("ai", description="Assistant IA")
ocr_ns = Namespace("ocr", description="OCR documents")


@ai_ns.route("/conversations")
class ConversationList(Resource):
    @jwt_required_custom
    def get(self, user):
        convs = AIConversation.query.filter_by(
            user_id=user.id, deleted_at=None
        ).order_by(AIConversation.updated_at.desc()).all()
        return [{
            "id": str(c.id),
            "title": c.title,
            "created_at": c.created_at.isoformat(),
        } for c in convs], 200

    @jwt_required_custom
    def post(self, user):
        data = ai_ns.payload or {}
        conv = AIService.create_conversation(
            user.id, user.cabinet_id,
            title=data.get("title"),
            dossier_id=data.get("dossier_id"),
        )
        return {"id": str(conv.id), "title": conv.title}, 201


@ai_ns.route("/conversations/<string:conv_id>/messages")
class ConversationMessages(Resource):
    @jwt_required_custom
    def get(self, user, conv_id):
        conv = AIConversation.query.filter_by(
            id=conv_id, user_id=user.id, deleted_at=None
        ).first_or_404()
        return [{
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        } for m in conv.messages], 200

    @jwt_required_custom
    def post(self, user, conv_id):
        message = (ai_ns.payload or {}).get("message", "")
        if not message:
            return {"message": "Message requis"}, 400

        def generate():
            for chunk in AIService.chat(conv_id, message, user.id):
                yield f"data: {chunk}\n\n"
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
