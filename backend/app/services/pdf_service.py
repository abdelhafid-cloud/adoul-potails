import io

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle

from app.services.pdf_arabic import (
    bilingual_block,
    bilingual_table_cell,
    esc,
    pdf_styles,
    shape_ar,
    table_header_cell,
)
from app.services.pdf_layout import (
    add_meta_card,
    add_report_title,
    add_section_heading,
    build_meta_rows,
    create_document,
    extend_layout_styles,
    styled_data_table,
)


LABELS = {
    "report_title_fr": "Rapport de Calcul d'Héritage",
    "report_title_ar": "تقرير حساب الميراث",
    "estate_summary_fr": "Synthèse du patrimoine",
    "estate_summary_ar": "ملخص التركة",
    "gross_fr": "Patrimoine brut",
    "gross_ar": "إجمالي التركة",
    "real_estate_fr": "Immobilier",
    "real_estate_ar": "العقارات",
    "bank_fr": "Comptes bancaires",
    "bank_ar": "الحسابات البنكية",
    "debts_fr": "Dettes",
    "debts_ar": "الديون",
    "fees_fr": "Frais et charges",
    "fees_ar": "المصاريف",
    "net_fr": "Patrimoine net",
    "net_ar": "صافي التركة",
    "distribution_fr": "Répartition entre les héritiers",
    "distribution_ar": "توزيع الميراث على الورثة",
    "heir_fr": "Héritier",
    "heir_ar": "الوارث",
    "type_fr": "Type",
    "type_ar": "النوع",
    "share_fr": "Part %",
    "share_ar": "النسبة %",
    "amount_fr": "Montant (MAD)",
    "amount_ar": "المبلغ (درهم)",
    "legal_fr": "Fondements juridiques",
    "legal_ar": "الأساس القانوني والشرعي",
    "steps_fr": "Étapes du calcul",
    "steps_ar": "مراحل الحساب",
    "heir_proofs_fr": "Preuves par héritier",
    "heir_proofs_ar": "أدلة كل وارث",
    "heir_details_fr": "Détail par héritier",
    "heir_details_ar": "تفصيل كل وارث",
    "status_fr": "Statut",
    "status_ar": "الحالة",
    "gender_fr": "Genre",
    "gender_ar": "الجنس",
    "reason_fr": "Motif",
    "reason_ar": "السبب",
    "inherits_fr": "Hérite",
    "inherits_ar": "يرث",
    "blocked_fr": "Exclu (hajb)",
    "blocked_ar": "محجوب",
    "quran_fr": "Coran",
    "quran_ar": "القرآن",
    "maliki_fr": "École malikite",
    "maliki_ar": "المذهب المالكي",
    "moudawana_fr": "Moudawana",
    "moudawana_ar": "مدونة الأسرة",
    "client_fr": "Client",
    "client_ar": "العميل",
    "dossier_fr": "N° dossier",
    "dossier_ar": "رقم الملف",
    "title_fr": "Intitulé",
    "title_ar": "العنوان",
    "cin_fr": "CIN",
    "cin_ar": "البطاقة الوطنية",
    "item_fr": "Poste",
    "item_ar": "البند",
    "share_distribution_fr": "Répartition du partage",
    "share_distribution_ar": "توزيع حصص التقسيم",
    "beneficiary_fr": "Bénéficiaire",
    "beneficiary_ar": "المستفيد",
    "soultes_fr": "Soultes (compensations)",
    "soultes_ar": "التسويات",
    "total_fees_fr": "Total frais estimés",
    "total_fees_ar": "إجمالي الرسوم التقديرية",
    "deceased_fr": "Informations du défunt",
    "deceased_ar": "معلومات الهالك",
    "deceased_name_fr": "Nom",
    "deceased_name_ar": "الاسم",
    "death_date_fr": "Date de décès",
    "death_date_ar": "تاريخ الوفاة",
    "death_place_fr": "Lieu de décès",
    "death_place_ar": "مكان الوفاة",
    "excluded_summary_fr": "Héritiers exclus (المحجوبون)",
    "excluded_summary_ar": "المحجوبون",
    "adjustments_fr": "Corrections (العول / الرد)",
    "adjustments_ar": "التصحيحات",
    "summary_kpi_fr": "Synthèse du calcul",
    "summary_kpi_ar": "ملخص الحساب",
    "disclaimer_fr": (
        "Ce document est généré automatiquement par Adoul AI à titre indicatif. "
        "Il ne remplace pas l'acte authentique ni l'avis d'un adoul habilité."
    ),
    "disclaimer_ar": (
        "هذا المستند صادر عن منصة Adoul AI للإرشاد فقط "
        "ولا يغني عن محضر موثق أو رأي عدل مرخص."
    ),
}

from app.constants.heir_types import heir_label_ar, normalize_heir_type

HEIR_TYPE_AR = {tid: heir_label_ar(tid) for tid in [
    "husband", "wife", "father", "mother",
    "paternal_grandfather", "paternal_grandmother", "maternal_grandmother",
    "son", "daughter",
    "grandson_from_son", "granddaughter_from_son", "grandson_from_daughter", "granddaughter_from_daughter",
    "full_brother", "full_sister", "consanguine_brother", "consanguine_sister",
    "uterine_brother", "uterine_sister",
    "full_paternal_uncle", "consanguine_paternal_uncle",
    "full_paternal_aunt", "consanguine_paternal_aunt",
    "maternal_uncle", "maternal_aunt",
    "son_full_brother", "son_consanguine_brother",
    "son_full_paternal_uncle", "son_consanguine_paternal_uncle", "son_son_paternal_uncle",
    "daughter_full_paternal_uncle", "daughter_consanguine_paternal_uncle",
    "son_maternal_uncle", "daughter_maternal_uncle",
    "fetus", "missing_person", "other",
]}
HEIR_TYPE_AR["brother"] = heir_label_ar("full_brother")
HEIR_TYPE_AR["sister"] = heir_label_ar("full_sister")


def _heir_type_ar(heir_type: str) -> str:
    canonical = normalize_heir_type(heir_type)
    return HEIR_TYPE_AR.get(canonical, HEIR_TYPE_AR.get(heir_type, heir_type))


class PDFService:
    @staticmethod
    def _styles():
        base = pdf_styles(getSampleStyleSheet())
        return extend_layout_styles(base)

    @staticmethod
    def _total_highlight_box(total: float, s) -> Table:
        total_style = ParagraphStyle(
            "TotalWhite",
            parent=s["report_title_fr"],
            textColor=colors.white,
            alignment=TA_CENTER,
            fontSize=16,
        )
        box = Table(
            [[Paragraph(f"<b>{total:,.2f} MAD</b>", total_style)]],
            colWidths=[16 * cm],
        )
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ]))
        return box

    @staticmethod
    def _add_disclaimer(elements, s):
        elements.append(Spacer(1, 0.5 * cm))
        disclaimer = Table(
            [[
                Paragraph(f"<i>{esc(LABELS['disclaimer_fr'])}</i>", s["legal_fr"]),
                Paragraph(
                    f'<font name="NotoSansArabic"><i>{esc(shape_ar(LABELS["disclaimer_ar"]))}</i></font>',
                    s["legal_ar"],
                ),
            ]],
            colWidths=[8.5 * cm, 8.5 * cm],
        )
        disclaimer.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#fcd34d")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(disclaimer)

    @staticmethod
    def generate_inheritance_report(calculation: dict, cabinet_name: str = "Cabinet Adoul") -> bytes:
        buffer = io.BytesIO()
        doc_title = LABELS["report_title_fr"]
        doc, on_first, on_later = create_document(buffer, cabinet_name, doc_title)
        s = PDFService._styles()
        elements = []

        calc_title = calculation.get("title")
        add_report_title(
            elements, s,
            LABELS["report_title_fr"],
            LABELS["report_title_ar"],
            subtitle=calc_title,
        )
        add_meta_card(elements, s, build_meta_rows(
            calculation.get("client"), calculation.get("dossier"), LABELS
        ))

        deceased = calculation.get("deceased_info") or (legal := calculation.get("legal_proof") or {}).get("deceased") or {}
        report = (calculation.get("legal_proof") or {}).get("report") or {}
        if deceased and any(deceased.values()):
            add_section_heading(elements, s, LABELS["deceased_fr"], LABELS["deceased_ar"])
            deceased_rows = [[
                table_header_cell(LABELS["item_fr"], LABELS["item_ar"], s["cell"]),
                table_header_cell(LABELS["title_fr"], LABELS["title_ar"], s["cell"]),
            ]]
            if deceased.get("name_fr") or deceased.get("name_ar"):
                deceased_rows.append([
                    bilingual_table_cell(LABELS["deceased_name_fr"], LABELS["deceased_name_ar"], s["cell"]),
                    bilingual_table_cell(deceased.get("name_fr", ""), deceased.get("name_ar", ""), s["cell"]),
                ])
            if deceased.get("cin"):
                deceased_rows.append([
                    bilingual_table_cell(LABELS["cin_fr"], LABELS["cin_ar"], s["cell"]),
                    Paragraph(esc(deceased["cin"]), s["cell"]),
                ])
            if deceased.get("death_date"):
                deceased_rows.append([
                    bilingual_table_cell(LABELS["death_date_fr"], LABELS["death_date_ar"], s["cell"]),
                    Paragraph(esc(deceased["death_date"]), s["cell"]),
                ])
            if deceased.get("death_place"):
                deceased_rows.append([
                    bilingual_table_cell(LABELS["death_place_fr"], LABELS["death_place_ar"], s["cell"]),
                    bilingual_table_cell(deceased.get("death_place", ""), deceased.get("death_place", ""), s["cell"]),
                ])
            elements.append(styled_data_table(deceased_rows, [6 * cm, 10 * cm]))

        if report:
            add_section_heading(elements, s, LABELS["summary_kpi_fr"], LABELS["summary_kpi_ar"])
            kpi_data = [[
                bilingual_table_cell("Patrimoine net / صافي التركة", "", s["cell"]),
                Paragraph(f"<b>{report.get('net_estate', 0):,.2f} MAD</b>", s["cell_amount"]),
            ], [
                bilingual_table_cell("Héritiers / الورثة", "", s["cell"]),
                Paragraph(str(report.get("heirs_count", 0)), s["cell_amount"]),
            ], [
                bilingual_table_cell("Exclus (hajb) / المحجوبون", "", s["cell"]),
                Paragraph(str(report.get("excluded_count", 0)), s["cell_amount"]),
            ]]
            if report.get("has_awl"):
                kpi_data.append([
                    bilingual_table_cell("العول appliqué", "العول", s["cell"]),
                    Paragraph("Oui / نعم", s["cell"]),
                ])
            if report.get("has_radd"):
                kpi_data.append([
                    bilingual_table_cell("الرد appliqué", "الرد", s["cell"]),
                    Paragraph("Oui / نعم", s["cell"]),
                ])
            elements.append(styled_data_table(kpi_data, [10 * cm, 6 * cm]))

        adjustments = calculation.get("adjustments") or (calculation.get("legal_proof") or {}).get("adjustments") or []
        if adjustments:
            add_section_heading(elements, s, LABELS["adjustments_fr"], LABELS["adjustments_ar"])
            for adj in adjustments:
                elements.append(Paragraph(
                    f"<b>{esc(adj.get('title_fr', ''))}</b> — {esc(adj.get('detail_fr', ''))}",
                    s["legal_fr"],
                ))
                if adj.get("title_ar") or adj.get("detail_ar"):
                    ar_text = f"{adj.get('title_ar', '')} — {adj.get('detail_ar', '')}"
                    elements.append(Paragraph(
                        f'<font name="NotoSansArabic">{esc(shape_ar(ar_text))}</font>',
                        s["legal_ar"],
                    ))
                elements.append(Spacer(1, 0.15 * cm))

        add_section_heading(elements, s, LABELS["estate_summary_fr"], LABELS["estate_summary_ar"])

        row_keys = [
            ("gross", "total_estate_value", False),
            ("real_estate", "real_estate_value", False),
            ("bank", "bank_accounts_value", False),
            ("debts", "debts", True),
            ("fees", "fees", True),
            ("net", "net_estate_value", False),
        ]
        summary_data = [[
            table_header_cell(LABELS["item_fr"], LABELS["item_ar"], s["cell"]),
            table_header_cell(
                LABELS["amount_fr"].replace(" (MAD)", ""),
                LABELS["amount_ar"].replace(" (درهم)", ""),
                s["cell"],
            ),
        ]]
        for key, field, negate in row_keys:
            val = calculation.get(field, 0)
            prefix = "-" if negate and val else ""
            label_fr = LABELS[f"{key}_fr"]
            label_ar = LABELS[f"{key}_ar"]
            summary_data.append([
                bilingual_table_cell(label_fr, label_ar, s["cell"]),
                Paragraph(f"<b>{prefix}{val:,.2f} MAD</b>", s["cell_amount"]),
            ])

        elements.append(styled_data_table(summary_data, [10 * cm, 6 * cm], highlight_last_row=True))

        distribution = calculation.get("distribution", [])
        if distribution:
            add_section_heading(elements, s, LABELS["distribution_fr"], LABELS["distribution_ar"])
            dist_data = [[
                table_header_cell(LABELS["heir_fr"], LABELS["heir_ar"], s["cell"]),
                table_header_cell(LABELS["type_fr"], LABELS["type_ar"], s["cell"]),
                table_header_cell(LABELS["share_fr"], LABELS["share_ar"], s["cell"]),
                table_header_cell(
                    LABELS["amount_fr"].replace(" (MAD)", ""),
                    LABELS["amount_ar"].replace(" (درهم)", ""),
                    s["cell"],
                ),
            ]]
            for d in distribution:
                heir_type = d.get("type", "")
                type_ar = HEIR_TYPE_AR.get(heir_type, heir_type)
                dist_data.append([
                    Paragraph(f"<b>{esc(d.get('name', ''))}</b>", s["cell"]),
                    bilingual_table_cell(heir_type, type_ar, s["cell"]),
                    Paragraph(f"{d.get('percentage', 0):.2f}%", s["cell_amount"]),
                    Paragraph(f"{d.get('amount', 0):,.2f}", s["cell_amount"]),
                ])
            elements.append(styled_data_table(dist_data, [5 * cm, 4 * cm, 3 * cm, 4 * cm]))

        heir_details = calculation.get("heir_details") or []
        if heir_details:
            add_section_heading(elements, s, LABELS["heir_details_fr"], LABELS["heir_details_ar"])
            detail_data = [[
                table_header_cell(LABELS["heir_fr"], LABELS["heir_ar"], s["cell"]),
                table_header_cell(LABELS["gender_fr"], LABELS["gender_ar"], s["cell"]),
                table_header_cell(LABELS["status_fr"], LABELS["status_ar"], s["cell"]),
                table_header_cell(LABELS["share_fr"], LABELS["share_ar"], s["cell"]),
                table_header_cell(
                    LABELS["amount_fr"].replace(" (MAD)", ""),
                    LABELS["amount_ar"].replace(" (درهم)", ""),
                    s["cell"],
                ),
                table_header_cell(LABELS["reason_fr"], LABELS["reason_ar"], s["cell"]),
            ]]
            for h in heir_details:
                blocked = h.get("status") == "blocked"
                status_fr = LABELS["blocked_fr"] if blocked else LABELS["inherits_fr"]
                status_ar = LABELS["blocked_ar"] if blocked else LABELS["inherits_ar"]
                detail_data.append([
                    bilingual_table_cell(h.get("name", ""), h.get("name_ar", ""), s["cell"]),
                    bilingual_table_cell(
                        h.get("gender_fr") or "—", h.get("gender_ar") or "", s["cell"],
                    ),
                    bilingual_table_cell(status_fr, status_ar, s["cell"]),
                    Paragraph(f"{h.get('percentage', 0):.2f}%", s["cell_amount"]),
                    Paragraph(f"{h.get('amount', 0):,.2f}", s["cell_amount"]),
                    bilingual_table_cell(h.get("reason_fr") or "—", h.get("reason_ar") or "", s["cell"]),
                ])
            elements.append(styled_data_table(detail_data, [3.5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 3 * cm, 4 * cm]))

        legal = calculation.get("legal_proof") or {}
        excluded = calculation.get("excluded_heirs") or legal.get("excluded_heirs") or []
        if excluded:
            add_section_heading(elements, s, LABELS["excluded_summary_fr"], LABELS["excluded_summary_ar"])
            ex_data = [[
                table_header_cell(LABELS["heir_fr"], LABELS["heir_ar"], s["cell"]),
                table_header_cell(LABELS["reason_fr"], LABELS["reason_ar"], s["cell"]),
            ]]
            for ex in excluded:
                ex_data.append([
                    bilingual_table_cell(ex.get("name", ""), ex.get("name_ar", ""), s["cell"]),
                    bilingual_table_cell(ex.get("reason_fr") or "—", ex.get("reason_ar") or "", s["cell"]),
                ])
            elements.append(styled_data_table(ex_data, [6 * cm, 10 * cm]))

        summary_legal = legal.get("summary") or {}
        if summary_legal:
            add_section_heading(elements, s, LABELS["legal_fr"], LABELS["legal_ar"])
            for fr_key, ar_key in (
                ("school_fr", "school_ar"),
                ("law_fr", "law_ar"),
                ("ministry_fr", "ministry_ar"),
            ):
                fr = summary_legal.get(fr_key)
                ar = summary_legal.get(ar_key)
                if fr or ar:
                    elements.extend(bilingual_block(fr, ar, s["legal_fr"], s["legal_ar"]))

        steps = legal.get("steps") or []
        if steps:
            add_section_heading(elements, s, LABELS["steps_fr"], LABELS["steps_ar"])
            for step in steps:
                step_num = step.get("step", "")
                title_fr = step.get("title_fr", "")
                detail_fr = step.get("detail_fr", "")
                title_ar = step.get("title_ar", "")
                detail_ar = step.get("detail_ar", "")
                elements.append(Paragraph(
                    f"<b>{esc(step_num)}.</b> <b>{esc(title_fr)}</b> — {esc(detail_fr)}",
                    s["legal_fr"],
                ))
                if title_ar or detail_ar:
                    ar_text = f"{step_num}. {title_ar} — {detail_ar}"
                    elements.append(Paragraph(
                        f'<font name="NotoSansArabic">{esc(shape_ar(ar_text))}</font>',
                        s["legal_ar"],
                    ))

        heir_proofs = legal.get("heir_proofs") or []
        if heir_proofs:
            add_section_heading(elements, s, LABELS["heir_proofs_fr"], LABELS["heir_proofs_ar"])
            for hp in heir_proofs:
                basis = hp.get("legal_basis") or {}
                name = hp.get("name") or hp.get("type", "")
                heir_type = hp.get("type", "")
                type_ar = HEIR_TYPE_AR.get(heir_type, heir_type)
                blocked = hp.get("status") == "blocked"
                pct = hp.get("percentage", 0)
                amt = hp.get("amount", 0)
                if blocked:
                    share_line = f"{LABELS['blocked_fr']} — {hp.get('reason_fr', '')}"
                else:
                    share_line = f"{pct:.2f}% — {amt:,.2f} MAD"
                elements.append(Paragraph(
                    f"<b>{esc(name)}</b> ({esc(heir_type)} / "
                    f"<font name='NotoSansArabic'>{esc(shape_ar(type_ar))}</font>) — "
                    f"{esc(basis.get('category_fr', ''))} — <b>{esc(share_line)}</b>",
                    s["legal_fr"],
                ))
                for label_fr, label_ar, key_fr, key_ar in (
                    (LABELS["quran_fr"], LABELS["quran_ar"], "quran_fr", "quran_ar"),
                    (LABELS["maliki_fr"], LABELS["maliki_ar"], "maliki_fr", "maliki_ar"),
                    (LABELS["moudawana_fr"], LABELS["moudawana_ar"], "moudawana_fr", "moudawana_ar"),
                ):
                    if basis.get(key_fr):
                        elements.append(Paragraph(
                            f"• {label_fr} : {esc(basis[key_fr])}",
                            s["legal_fr"],
                        ))
                    if basis.get(key_ar):
                        elements.append(Paragraph(
                            f'<font name="NotoSansArabic">• {esc(shape_ar(f"{label_ar} : {basis[key_ar]}"))}</font>',
                            s["legal_ar"],
                        ))
                elements.append(Spacer(1, 0.12 * cm))

        PDFService._add_disclaimer(elements, s)
        doc.build(elements, onFirstPage=on_first, onLaterPages=on_later)
        buffer.seek(0)
        return buffer.read()

    @staticmethod
    def generate_act_report(calculation: dict, cabinet_name: str = "Cabinet Adoul") -> bytes:
        type_titles = {
            "sale": ("Rapport — Vente immobilière", "تقرير — البيع العقاري"),
            "donation": ("Rapport — Donation", "تقرير — الهبة"),
            "procuration": ("Rapport — Procuration", "تقرير — الوكالة"),
            "marriage": ("Rapport — Contrat de mariage (Sadaq)", "تقرير — عقد الزواج (الصداق)"),
            "wasiyyah": ("Rapport — Wasiyyah (Legs)", "تقرير — الوصية"),
            "other": ("Rapport — Acte divers", "تقرير — acte متنوع"),
        }
        act_type = calculation.get("type", "other")
        title_fr, title_ar = type_titles.get(act_type, type_titles["other"])

        buffer = io.BytesIO()
        doc, on_first, on_later = create_document(buffer, cabinet_name, title_fr)
        s = PDFService._styles()
        elements = []

        add_report_title(elements, s, title_fr, title_ar, subtitle=calculation.get("title"))
        add_meta_card(elements, s, build_meta_rows(
            calculation.get("client"), calculation.get("dossier"), LABELS
        ))

        total = calculation.get("total_amount", 0)
        add_section_heading(elements, s, LABELS["total_fees_fr"], LABELS["total_fees_ar"])

        elements.append(PDFService._total_highlight_box(total, s))
        elements.append(Spacer(1, 0.3 * cm))

        lines = (calculation.get("results") or {}).get("lines") or []
        if lines:
            table_data = [[
                table_header_cell(LABELS["item_fr"], LABELS["item_ar"], s["cell"]),
                table_header_cell(
                    LABELS["amount_fr"].replace(" (MAD)", ""),
                    LABELS["amount_ar"].replace(" (درهم)", ""),
                    s["cell"],
                ),
            ]]
            for line in lines:
                table_data.append([
                    bilingual_table_cell(line.get("label_fr"), line.get("label_ar"), s["cell"]),
                    Paragraph(f"{line.get('amount', 0):,.2f} MAD", s["cell_amount"]),
                ])
            elements.append(styled_data_table(table_data, [10 * cm, 6 * cm]))

        legal = calculation.get("legal_proof") or {}
        steps = legal.get("steps") or []
        if steps:
            add_section_heading(elements, s, LABELS["steps_fr"], LABELS["steps_ar"])
            for step in steps:
                elements.append(Paragraph(
                    f"<b>{esc(step.get('step', ''))}.</b> <b>{esc(step.get('title_fr', ''))}</b> — "
                    f"{esc(step.get('detail_fr', ''))}",
                    s["legal_fr"],
                ))
                if step.get("title_ar") or step.get("detail_ar"):
                    ar_text = f"{step.get('step', '')}. {step.get('title_ar', '')} — {step.get('detail_ar', '')}"
                    elements.append(Paragraph(
                        f'<font name="NotoSansArabic">{esc(shape_ar(ar_text))}</font>',
                        s["legal_ar"],
                    ))

        PDFService._add_disclaimer(elements, s)
        doc.build(elements, onFirstPage=on_first, onLaterPages=on_later)
        buffer.seek(0)
        return buffer.read()

    @staticmethod
    def generate_property_share_report(share: dict, cabinet_name: str = "Cabinet Adoul") -> bytes:
        buffer = io.BytesIO()
        title_fr = "Rapport — Partage immobilier"
        title_ar = "تقرير — تقسيم العقار"
        doc, on_first, on_later = create_document(buffer, cabinet_name, title_fr)
        s = PDFService._styles()
        elements = []

        add_report_title(elements, s, title_fr, title_ar, subtitle=share.get("title"))
        add_meta_card(elements, s, build_meta_rows(share.get("client"), share.get("dossier"), LABELS))

        total = share.get("total_value", 0)
        add_section_heading(elements, s, "Valeur totale", "القيمة الإجمالية")
        elements.append(PDFService._total_highlight_box(total, s))
        elements.append(Spacer(1, 0.3 * cm))

        distribution = share.get("distribution") or []
        if distribution:
            add_section_heading(
                elements, s, LABELS["share_distribution_fr"], LABELS["share_distribution_ar"]
            )
            dist_data = [[
                table_header_cell(LABELS["beneficiary_fr"], LABELS["beneficiary_ar"], s["cell"]),
                table_header_cell(LABELS["share_fr"], LABELS["share_ar"], s["cell"]),
                table_header_cell(
                    LABELS["amount_fr"].replace(" (MAD)", ""),
                    LABELS["amount_ar"].replace(" (درهم)", ""),
                    s["cell"],
                ),
            ]]
            for d in distribution:
                dist_data.append([
                    Paragraph(f"<b>{esc(str(d.get('name', '')))}</b>", s["cell"]),
                    Paragraph(f"{d.get('share_percentage', 0):.2f}%", s["cell_amount"]),
                    Paragraph(f"{d.get('amount', 0):,.2f} MAD", s["cell_amount"]),
                ])
            elements.append(styled_data_table(dist_data, [6 * cm, 4 * cm, 6 * cm]))

        assigned_any = any(d.get("properties_assigned") for d in distribution)
        if assigned_any:
            add_section_heading(elements, s, "Biens attribués", "العقارات المخصصة")
            for d in distribution:
                props = d.get("properties_assigned") or []
                if not props:
                    continue
                elements.append(Paragraph(
                    f"<b>{esc(str(d.get('name', '')))}</b>", s["cell"]
                ))
                prop_rows = [[
                    table_header_cell("Bien / العقار", "العقار", s["cell"]),
                    table_header_cell(
                        LABELS["amount_fr"].replace(" (MAD)", ""),
                        LABELS["amount_ar"].replace(" (درهم)", ""),
                        s["cell"],
                    ),
                ]]
                for p in props:
                    prop_rows.append([
                        Paragraph(esc(str(p.get("name", ""))), s["cell"]),
                        Paragraph(f"{p.get('value', 0):,.2f} MAD", s["cell_amount"]),
                    ])
                elements.append(styled_data_table(prop_rows, [9 * cm, 7 * cm]))
                elements.append(Spacer(1, 0.15 * cm))

        soultes = share.get("soultes") or []
        if soultes:
            add_section_heading(elements, s, LABELS["soultes_fr"], LABELS["soultes_ar"])
            soulte_data = [[
                table_header_cell("De / من", "من", s["cell"]),
                table_header_cell("Bien / العقار", "العقار", s["cell"]),
                table_header_cell(
                    LABELS["amount_fr"].replace(" (MAD)", ""),
                    LABELS["amount_ar"].replace(" (درهم)", ""),
                    s["cell"],
                ),
            ]]
            for sol in soultes:
                soulte_data.append([
                    Paragraph(esc(str(sol.get("from", ""))), s["cell"]),
                    Paragraph(esc(str(sol.get("property", ""))), s["cell"]),
                    Paragraph(f"{sol.get('amount', 0):,.2f} MAD", s["cell_amount"]),
                ])
            elements.append(styled_data_table(soulte_data, [5 * cm, 7 * cm, 4 * cm]))

        PDFService._add_disclaimer(elements, s)
        doc.build(elements, onFirstPage=on_first, onLaterPages=on_later)
        buffer.seek(0)
        return buffer.read()

    @staticmethod
    def save_pdf(content: bytes, filename: str, subfolder: str = "reports") -> str:
        import os

        upload_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "uploads", subfolder,
        )
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return filepath
