"""Réponse HTTP pour export PDF."""

from flask import make_response


def pdf_response(pdf_bytes: bytes, filename: str):
    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Type"
    response.headers["Cache-Control"] = "no-cache"
    return response
