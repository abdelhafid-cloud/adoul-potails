from decimal import Decimal
from typing import Any

from app.constants.heir_types import normalize_heir_type
from app.services.faraid_engine import FaraidEngine
from app.services.inheritance_legal import build_legal_proof
from app.services.inheritance_verification import build_legal_verification
from app.services.wasiyyah_service import calculate_wasiyyah


def _normalize_heirs(heirs: list[dict]) -> list[dict]:
    return [{**h, "type": normalize_heir_type(h.get("type", "other"))} for h in heirs]


def _has_wasiyyah(data: dict) -> bool:
    if data.get("has_wasiyyah") is False:
        return False
    return Decimal(str(data.get("wasiyyah_amount", 0) or 0)) > 0


def _apply_wasiyyah_steps(legal_proof: dict, net_gross: Decimal, wasiyyah_results: dict) -> None:
    applied = wasiyyah_results.get("wasiyyah_amount_applied", 0)
    remainder = wasiyyah_results.get("remainder_for_heirs", 0)
    legatee = wasiyyah_results.get("legatee_name") or wasiyyah_results.get("legatee_name_ar") or "—"
    legatee_ar = wasiyyah_results.get("legatee_name_ar") or legatee
    status_fr = wasiyyah_results.get("status_fr", "")
    status_ar = wasiyyah_results.get("status_ar", "")

    steps = legal_proof.get("steps", [])
    if len(steps) >= 3:
        steps[2]["title_fr"] = "Patrimoine net (avant wasiyyah)"
        steps[2]["title_ar"] = "صافي التركة (قبل الوصية)"
        steps[2]["detail_fr"] = f"Tarika nette : {float(net_gross):,.2f} MAD"
        steps[2]["detail_ar"] = f"صافي التركة: {float(net_gross):,.2f} درهم"

    wasiyyah_steps = [
        {
            "step": "3b",
            "title_fr": "Wasiyyah (وصية) — plafond 1/3",
            "title_ar": "الوصية — حد الثلث",
            "detail_fr": (
                f"Montant retenu : {applied:,.2f} MAD — "
                f"موصى له : {legatee} — {status_fr}"
            ),
            "detail_ar": (
                f"المبلغ المطبق: {applied:,.2f} درهم — "
                f"الموصى له: {legatee_ar} — {status_ar}"
            ),
        },
        {
            "step": "3c",
            "title_fr": "Base des فرائض (après wasiyyah)",
            "title_ar": "أساس الفرائض (بعد الوصية)",
            "detail_fr": f"Reste distribué aux héritiers : {remainder:,.2f} MAD",
            "detail_ar": f"الباقي للورثة: {remainder:,.2f} درهم",
        },
    ]
    insert_at = 3 if len(steps) >= 3 else len(steps)
    for i, step in enumerate(wasiyyah_steps):
        steps.insert(insert_at + i, step)

    for i, step in enumerate(steps, start=1):
        step["step"] = str(i)

    legal_proof["steps"] = steps


class InheritanceService:
    @staticmethod
    def calculate(data: dict) -> dict:
        total = Decimal(str(data.get("total_estate_value", 0)))
        real_estate = Decimal(str(data.get("real_estate_value", 0)))
        bank = Decimal(str(data.get("bank_accounts_value", 0)))
        debts = Decimal(str(data.get("debts", 0)))
        fees = Decimal(str(data.get("fees", 0)))

        gross = total or (real_estate + bank)
        net_gross = gross - debts - fees
        if net_gross < 0:
            net_gross = Decimal("0")

        wasiyyah_payload: dict[str, Any] | None = None
        faraid_base = net_gross

        if _has_wasiyyah(data):
            wasiyyah_result = calculate_wasiyyah({
                "net_estate_value": float(net_gross),
                "debts_before_wasiyyah": 0,
                "funeral_expenses": float(data.get("funeral_expenses", 0) or 0),
                "wasiyyah_amount": float(data.get("wasiyyah_amount", 0) or 0),
                "wasiyyah_kind": data.get("wasiyyah_kind", "cash"),
                "legatee_name": data.get("legatee_name", ""),
                "legatee_name_ar": data.get("legatee_name_ar", ""),
                "legatee_is_heir": bool(data.get("legatee_is_heir", False)),
                "heirs_consent": bool(data.get("heirs_consent", False)),
            })
            wasiyyah_payload = wasiyyah_result
            faraid_base = Decimal(str(wasiyyah_result["results"]["remainder_for_heirs"]))

        heirs = _normalize_heirs(data.get("heirs", []))
        engine_result = FaraidEngine.compute(heirs, faraid_base)
        distribution = engine_result["distribution"]
        heir_details = engine_result["heir_details"]
        adjustments = engine_result.get("adjustments", [])
        calculation_meta = engine_result.get("calculation_meta", {})

        legal_verification = build_legal_verification(
            heirs, heir_details, calculation_meta, adjustments,
        )
        legal_proof = build_legal_proof(
            {**data, "heirs": heirs},
            faraid_base,
            gross,
            distribution,
            heir_details,
            adjustments=adjustments,
            calculation_meta=calculation_meta,
            legal_verification=legal_verification,
        )

        wasiyyah_results: dict[str, Any] | None = None
        if wasiyyah_payload:
            wasiyyah_results = wasiyyah_payload["results"]
            legal_proof["wasiyyah"] = wasiyyah_results
            legal_proof["wasiyyah_legal_proof"] = wasiyyah_payload.get("legal_proof")
            legal_proof["net_estate_before_wasiyyah"] = float(net_gross)
            legal_proof["faraid_base"] = float(faraid_base)
            legal_proof["report"]["net_estate"] = float(net_gross)
            legal_proof["report"]["faraid_base"] = float(faraid_base)
            legal_proof["report"]["has_wasiyyah"] = True
            legal_proof["report"]["wasiyyah_applied"] = wasiyyah_results.get(
                "wasiyyah_amount_applied", 0
            )
            _apply_wasiyyah_steps(legal_proof, net_gross, wasiyyah_results)

        excluded_heirs = [
            d for d in heir_details if d.get("status") in ("blocked", "pending")
        ]

        deceased_info = (legal_proof.get("deceased") or {})

        return {
            "deceased_info": deceased_info,
            "total_estate_value": float(gross),
            "real_estate_value": float(real_estate),
            "bank_accounts_value": float(bank),
            "debts": float(debts),
            "fees": float(fees),
            "net_estate_value": float(net_gross),
            "faraid_base": float(faraid_base),
            "heirs": heirs,
            "distribution": distribution,
            "heir_details": heir_details,
            "excluded_heirs": excluded_heirs,
            "adjustments": adjustments,
            "calculation_meta": calculation_meta,
            "legal_verification": legal_verification,
            "legal_proof": legal_proof,
            "wasiyyah": wasiyyah_results,
        }
