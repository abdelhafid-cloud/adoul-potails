import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

PROFILE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
DOCUMENT_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_PROFILE_BYTES = 5 * 1024 * 1024
MAX_DOCUMENT_BYTES = 20 * 1024 * 1024


class UploadService:
    @staticmethod
    def allowed_image(filename: str, extensions: set[str] | None = None) -> bool:
        if not filename or "." not in filename:
            return False
        ext = filename.rsplit(".", 1)[1].lower()
        allowed = extensions or current_app.config.get("ALLOWED_EXTENSIONS", PROFILE_EXTENSIONS)
        return ext in allowed

    @staticmethod
    def save_profile_image(file) -> str:
        if not file or not file.filename:
            raise ValueError("Aucune image fournie.")

        if not UploadService.allowed_image(file.filename, PROFILE_EXTENSIONS):
            raise ValueError("Format non autorisé. Utilisez JPG, PNG ou WEBP.")

        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        if size > MAX_PROFILE_BYTES:
            raise ValueError("Image trop volumineuse (max 5 Mo).")

        upload_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], "profiles")
        os.makedirs(upload_dir, exist_ok=True)

        ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        return f"profiles/{filename}"

    @staticmethod
    def save_dossier_document(file, dossier_id: str) -> tuple[str, str, int]:
        if not file or not file.filename:
            raise ValueError("Aucun fichier fourni.")

        if not UploadService.allowed_image(file.filename, DOCUMENT_EXTENSIONS):
            raise ValueError("Format non autorisé. Utilisez PDF, JPG ou PNG.")

        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        if size > MAX_DOCUMENT_BYTES:
            raise ValueError("Fichier trop volumineux (max 20 Mo).")

        upload_dir = os.path.join(
            current_app.config["UPLOAD_FOLDER"], "dossiers", str(dossier_id),
        )
        os.makedirs(upload_dir, exist_ok=True)

        ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        relative = f"dossiers/{dossier_id}/{filename}"
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], relative)
        file.save(filepath)
        return relative, ext, size

    @staticmethod
    def delete_file(relative_path: str | None) -> None:
        if not relative_path:
            return
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], relative_path)
        if os.path.isfile(filepath):
            os.remove(filepath)

    @staticmethod
    def public_url(relative_path: str | None) -> str | None:
        if not relative_path:
            return None
        base = os.getenv("API_PUBLIC_URL", "http://localhost:5001").rstrip("/")
        return f"{base}/api/v1/uploads/{relative_path}"
