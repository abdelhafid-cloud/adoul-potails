from flask_restx import Namespace, Resource

from app.middleware.auth import jwt_required_custom
from app.services.ocr_service import OCRService

ocr_ns = Namespace("ocr", description="OCR documents")


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
