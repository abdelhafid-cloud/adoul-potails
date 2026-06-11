import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename


class OCRService:
    @staticmethod
    def allowed_file(filename: str) -> bool:
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower()
            in current_app.config["ALLOWED_EXTENSIONS"]
        )

    @staticmethod
    def save_upload(file, subfolder: str = "ocr") -> str:
        if not OCRService.allowed_file(file.filename):
            raise ValueError("Type de fichier non autorisé.")

        upload_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
        os.makedirs(upload_dir, exist_ok=True)

        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        return filepath

    @staticmethod
    def extract_text(filepath: str) -> dict:
        ext = filepath.rsplit(".", 1)[-1].lower()
        text = ""

        try:
            if ext == "pdf":
                text = OCRService._extract_from_pdf(filepath)
            else:
                text = OCRService._extract_from_image(filepath)
        except Exception as e:
            return {"raw_text": "", "error": str(e), "fields": {}}

        fields = OCRService._parse_fields(text)
        return {"raw_text": text, "fields": fields}

    @staticmethod
    def _extract_from_image(filepath: str) -> str:
        import pytesseract
        from PIL import Image

        image = Image.open(filepath)
        text_fr = pytesseract.image_to_string(image, lang="fra")
        text_ar = pytesseract.image_to_string(image, lang="ara")
        return text_fr + "\n" + text_ar

    @staticmethod
    def _extract_from_pdf(filepath: str) -> str:
        from pdf2image import convert_from_path
        import pytesseract

        pages = convert_from_path(filepath, dpi=200)
        texts = []
        for page in pages[:5]:
            texts.append(pytesseract.image_to_string(page, lang="fra+ara"))
        return "\n".join(texts)

    @staticmethod
    def _parse_fields(text: str) -> dict:
        import re

        fields = {}
        cin_match = re.search(r"\b[A-Z]{1,2}\d{5,8}\b", text.upper())
        if cin_match:
            fields["cin"] = cin_match.group()

        phone_match = re.search(r"(?:\+212|0)[5-7]\d{8}", text)
        if phone_match:
            fields["phone"] = phone_match.group()

        date_match = re.search(r"\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}", text)
        if date_match:
            fields["date"] = date_match.group()

        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if lines:
            fields["possible_name"] = lines[0]

        return fields
