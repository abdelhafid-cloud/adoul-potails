"""Utilitaires PDF bilingues (FR/AR) avec police arabe."""

from __future__ import annotations

import os
import xml.sax.saxutils as saxutils

import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, TableStyle

_FONTS_REGISTERED = False
_FONTS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "fonts")


def _register_fonts() -> None:
    global _FONTS_REGISTERED
    if _FONTS_REGISTERED:
        return
    regular = os.path.join(_FONTS_DIR, "NotoSansArabic-Regular.ttf")
    bold = os.path.join(_FONTS_DIR, "NotoSansArabic-Bold.ttf")
    if os.path.isfile(regular):
        pdfmetrics.registerFont(TTFont("NotoSansArabic", regular))
    if os.path.isfile(bold):
        pdfmetrics.registerFont(TTFont("NotoSansArabic-Bold", bold))
    _FONTS_REGISTERED = True


def shape_ar(text: str | None) -> str:
    if not text:
        return ""
    return get_display(arabic_reshaper.reshape(str(text)))


def esc(text: str | None) -> str:
    return saxutils.escape(str(text or ""))


def ar_paragraph(text: str | None, style: ParagraphStyle) -> str:
    return f'<font name="NotoSansArabic">{esc(shape_ar(text))}</font>'


def bilingual_block(fr: str | None, ar: str | None, fr_style: ParagraphStyle, ar_style: ParagraphStyle):
    items = []
    if fr:
        items.append(Paragraph(esc(fr), fr_style))
    if ar:
        items.append(Paragraph(ar_paragraph(ar, ar_style), ar_style))
    return items


def bilingual_table_cell(fr: str | None, ar: str | None, style: ParagraphStyle):
    """Cellule FR + AR — l'arabe utilise NotoSansArabic (évite les carrés noirs)."""
    if not fr and not ar:
        return Paragraph("—", style)
    html = esc(fr or "")
    if ar:
        html += f"<br/><font name='NotoSansArabic'>{esc(shape_ar(ar))}</font>"
    return Paragraph(html, style)


def table_header_cell(fr: str, ar: str, style: ParagraphStyle):
    """En-tête bilingue blanc sur fond navy."""
    header_style = ParagraphStyle(
        "TableHeader", parent=style,
        fontSize=9, textColor=colors.white, alignment=TA_CENTER, leading=12,
    )
    return Paragraph(
        f'<font color="white">{esc(fr)}</font><br/>'
        f'<font name="NotoSansArabic" color="white">{esc(shape_ar(ar))}</font>',
        header_style,
    )


def table_style_base() -> TableStyle:
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ])


def pdf_styles(base_styles):
    _register_fonts()
    return {
        "title_fr": ParagraphStyle(
            "TitleFR", parent=base_styles["Heading1"],
            fontSize=16, textColor="#1e3a5f", spaceAfter=4,
        ),
        "title_ar": ParagraphStyle(
            "TitleAR", parent=base_styles["Heading1"],
            fontName="NotoSansArabic-Bold", fontSize=16,
            textColor="#1e3a5f", alignment=TA_RIGHT, spaceAfter=8,
        ),
        "heading_fr": ParagraphStyle(
            "HeadingFR", parent=base_styles["Heading2"], spaceAfter=4,
        ),
        "heading_ar": ParagraphStyle(
            "HeadingAR", parent=base_styles["Heading2"],
            fontName="NotoSansArabic-Bold", fontSize=13,
            alignment=TA_RIGHT, spaceAfter=8,
        ),
        "normal_fr": ParagraphStyle(
            "NormalFR", parent=base_styles["Normal"], spaceAfter=3,
        ),
        "normal_ar": ParagraphStyle(
            "NormalAR", parent=base_styles["Normal"],
            fontName="NotoSansArabic", fontSize=10,
            alignment=TA_RIGHT, spaceAfter=6,
        ),
        "meta": ParagraphStyle(
            "Meta", parent=base_styles["Normal"], fontSize=9, textColor="#64748b",
        ),
        "meta_ar": ParagraphStyle(
            "MetaAR", parent=base_styles["Normal"],
            fontName="NotoSansArabic", fontSize=9,
            textColor="#64748b", alignment=TA_RIGHT,
        ),
        "cell": ParagraphStyle(
            "TableCell", parent=base_styles["Normal"],
            fontSize=9, alignment=TA_LEFT, leading=12,
        ),
    }
