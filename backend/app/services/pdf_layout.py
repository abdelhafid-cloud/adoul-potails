"""Mise en page professionnelle des rapports PDF Adoul AI."""

from __future__ import annotations

from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.services.pdf_arabic import esc, shape_ar, table_header_cell, table_style_base

BRAND_PRIMARY = colors.HexColor("#1e3a5f")
BRAND_ACCENT = colors.HexColor("#2563eb")
BRAND_MUTED = colors.HexColor("#64748b")
BRAND_BG = colors.HexColor("#f8fafc")
BRAND_BORDER = colors.HexColor("#e2e8f0")
BRAND_WHITE = colors.white

APP_NAME = "Adoul AI"
APP_TAGLINE_FR = "Plateforme numérique pour adouls"
APP_TAGLINE_AR = "منصة رقمية للعدول"


def create_document(buffer, cabinet_name: str, doc_title: str = "") -> tuple[SimpleDocTemplate, object, object]:
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2.1 * cm,
        bottomMargin=2.3 * cm,
        leftMargin=1.7 * cm,
        rightMargin=1.7 * cm,
        title=doc_title or APP_NAME,
        author=cabinet_name,
    )
    callback = _page_frame(cabinet_name)
    return doc, callback, callback


def _page_frame(cabinet_name: str):
    def _draw(canvas, doc):
        canvas.saveState()
        w, _h = A4
        header_h = 0.85 * cm
        header_y = A4[1] - header_h

        canvas.setFillColor(BRAND_PRIMARY)
        canvas.rect(0, header_y, w, header_h, fill=1, stroke=0)

        canvas.setFillColor(BRAND_WHITE)
        canvas.setFont("Helvetica", 9)
        canvas.drawString(1.7 * cm, header_y + 0.28 * cm, APP_TAGLINE_FR)
        canvas.drawRightString(
            w - 1.7 * cm,
            header_y + 0.28 * cm,
            datetime.now().strftime("%d/%m/%Y %H:%M"),
        )

        canvas.setStrokeColor(BRAND_BORDER)
        canvas.setLineWidth(0.6)
        canvas.line(1.7 * cm, 1.65 * cm, w - 1.7 * cm, 1.65 * cm)

        canvas.setFillColor(BRAND_MUTED)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(
            1.7 * cm,
            1.15 * cm,
            f"{cabinet_name} — Document confidentiel — usage professionnel",
        )
        canvas.drawRightString(
            w - 1.7 * cm,
            1.15 * cm,
            f"Page {doc.page} — Généré par {APP_NAME}",
        )
        canvas.restoreState()

    return _draw


def add_report_title(elements, s, title_fr: str, title_ar: str, subtitle: str | None = None):
    elements.append(Spacer(1, 0.25 * cm))

    title_row = Table(
        [[
            Paragraph(f"<b>{esc(title_fr)}</b>", s["report_title_fr"]),
            Paragraph(
                f'<font name="NotoSansArabic-Bold">{esc(shape_ar(title_ar))}</font>',
                s["report_title_ar"],
            ),
        ]],
        colWidths=[8.5 * cm, 8.5 * cm],
    )
    title_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(title_row)

    if subtitle:
        elements.append(Paragraph(esc(subtitle), s["subtitle"]))

    elements.append(HRFlowable(width="100%", thickness=2, color=BRAND_ACCENT, spaceBefore=6, spaceAfter=10))


def add_meta_card(elements, s, rows: list[tuple[str, str, str, str]]):
    """rows: (label_fr, label_ar, value_fr, value_ar optional)"""
    if not rows:
        return

    data = []
    for label_fr, label_ar, value_fr, value_ar in rows:
        label_cell = Paragraph(
            f"<b>{esc(label_fr)}</b><br/>"
            f"<font name='NotoSansArabic' size='8' color='#64748b'>{esc(shape_ar(label_ar))}</font>",
            s["meta_label"],
        )
        value_html = esc(value_fr or "—")
        if value_ar:
            value_html += (
                f"<br/><font name='NotoSansArabic' size='9'>{esc(shape_ar(value_ar))}</font>"
            )
        data.append([label_cell, Paragraph(value_html, s["meta_value"])])

    card = Table(data, colWidths=[5.5 * cm, 11.5 * cm])
    card.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_BG),
        ("BOX", (0, 0), (-1, -1), 0.6, BRAND_BORDER),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, BRAND_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(card)
    elements.append(Spacer(1, 0.45 * cm))


def add_section_heading(elements, s, title_fr: str, title_ar: str):
    elements.append(Spacer(1, 0.35 * cm))
    heading = Table(
        [[
            Paragraph(f"<b>{esc(title_fr)}</b>", s["section_fr"]),
            Paragraph(
                f'<font name="NotoSansArabic-Bold">{esc(shape_ar(title_ar))}</font>',
                s["section_ar"],
            ),
        ]],
        colWidths=[8.5 * cm, 8.5 * cm],
    )
    heading.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_BG),
        ("LINEBELOW", (0, 0), (-1, -1), 2, BRAND_ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(heading)
    elements.append(Spacer(1, 0.2 * cm))


def styled_data_table(data, col_widths, *, highlight_last_row: bool = False) -> Table:
    table = Table(data, colWidths=col_widths, repeatRows=1)
    style_commands = list(table_style_base().getCommands())

    style_commands.extend([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BRAND_WHITE, BRAND_BG]),
        ("LINEBELOW", (0, 0), (-1, 0), 1, BRAND_ACCENT),
    ])

    if highlight_last_row and len(data) > 1:
        style_commands.extend([
            ("BACKGROUND", (0, -1), (-1, -1), BRAND_PRIMARY),
            ("TEXTCOLOR", (0, -1), (-1, -1), BRAND_WHITE),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, BRAND_ACCENT),
        ])

    table.setStyle(TableStyle(style_commands))
    return table


def amount_table(col_widths_label: float = 10 * cm, col_widths_amount: float = 6 * cm):
    return [col_widths_label, col_widths_amount]


def build_meta_rows(client: dict | None, dossier: dict | None, labels: dict) -> list[tuple[str, str, str, str]]:
    client = client or {}
    dossier = dossier or {}
    rows: list[tuple[str, str, str, str]] = []

    if dossier.get("number"):
        rows.append((
            labels.get("dossier_fr", "Dossier"),
            labels.get("dossier_ar", "الملف"),
            str(dossier["number"]),
            "",
        ))
    if client.get("full_name"):
        rows.append((
            labels.get("client_fr", "Client"),
            labels.get("client_ar", "العميل"),
            str(client["full_name"]),
            client.get("full_name_ar") or "",
        ))
    if client.get("cin"):
        rows.append((
            labels.get("cin_fr", "CIN"),
            labels.get("cin_ar", "البطاقة الوطنية"),
            str(client["cin"]),
            "",
        ))
    if dossier.get("title"):
        rows.append((
            labels.get("title_fr", "Intitulé"),
            labels.get("title_ar", "العنوان"),
            str(dossier["title"]),
            "",
        ))
    return rows


def extend_layout_styles(base_styles: dict) -> dict:
    s = dict(base_styles)
    s["report_title_fr"] = ParagraphStyle(
        "ReportTitleFR",
        parent=base_styles["title_fr"],
        fontSize=18,
        textColor=BRAND_PRIMARY,
        leading=22,
        spaceAfter=0,
    )
    s["report_title_ar"] = ParagraphStyle(
        "ReportTitleAR",
        parent=base_styles["title_ar"],
        fontName="NotoSansArabic-Bold",
        fontSize=16,
        textColor=BRAND_PRIMARY,
        alignment=TA_RIGHT,
        leading=20,
        spaceAfter=0,
    )
    s["subtitle"] = ParagraphStyle(
        "Subtitle",
        parent=base_styles["meta"],
        fontSize=10,
        textColor=BRAND_MUTED,
        spaceAfter=4,
    )
    s["section_fr"] = ParagraphStyle(
        "SectionFR",
        parent=base_styles["heading_fr"],
        fontSize=11,
        textColor=BRAND_PRIMARY,
        leading=14,
    )
    s["section_ar"] = ParagraphStyle(
        "SectionAR",
        parent=base_styles["heading_ar"],
        fontName="NotoSansArabic-Bold",
        fontSize=10,
        textColor=BRAND_PRIMARY,
        alignment=TA_RIGHT,
        leading=14,
    )
    s["meta_label"] = ParagraphStyle(
        "MetaLabel",
        parent=base_styles["normal_fr"],
        fontSize=9,
        textColor=BRAND_MUTED,
        leading=12,
    )
    s["meta_value"] = ParagraphStyle(
        "MetaValue",
        parent=base_styles["normal_fr"],
        fontSize=10,
        textColor=BRAND_PRIMARY,
        leading=13,
    )
    s["cell"] = ParagraphStyle(
        "TableCellPro",
        parent=base_styles["cell"],
        fontSize=9,
        leading=12,
        alignment=TA_LEFT,
    )
    s["cell_amount"] = ParagraphStyle(
        "TableCellAmount",
        parent=base_styles["cell"],
        fontSize=9,
        leading=12,
        alignment=TA_RIGHT,
    )
    s["legal_fr"] = ParagraphStyle(
        "LegalFR",
        parent=base_styles["normal_fr"],
        fontSize=9,
        textColor=colors.HexColor("#334155"),
        leftIndent=8,
        spaceAfter=4,
    )
    s["legal_ar"] = ParagraphStyle(
        "LegalAR",
        parent=base_styles["normal_ar"],
        fontSize=9,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )
    return s
