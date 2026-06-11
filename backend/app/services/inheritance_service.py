from decimal import Decimal
from typing import Any

from app.constants.heir_types import normalize_heir_type
from app.services.faraid_engine import FaraidEngine
from app.services.inheritance_legal import build_legal_proof
from app.services.inheritance_verification import build_legal_verification


def _normalize_heirs(heirs: list[dict]) -> list[dict]:
    return [{**h, "type": normalize_heir_type(h.get("type", "other"))} for h in heirs]


class InheritanceService:
    @staticmethod
    def calculate(data: dict) -> dict:
        total = Decimal(str(data.get("total_estate_value", 0)))
        real_estate = Decimal(str(data.get("real_estate_value", 0)))
        bank = Decimal(str(data.get("bank_accounts_value", 0)))
        debts = Decimal(str(data.get("debts", 0)))
        fees = Decimal(str(data.get("fees", 0)))

        gross = total or (real_estate + bank)
        net = gross - debts - fees
        if net < 0:
            net = Decimal("0")

        heirs = _normalize_heirs(data.get("heirs", []))
        engine_result = FaraidEngine.compute(heirs, net)
        distribution = engine_result["distribution"]
        heir_details = engine_result["heir_details"]
        adjustments = engine_result.get("adjustments", [])
        calculation_meta = engine_result.get("calculation_meta", {})

        legal_verification = build_legal_verification(
            heirs, heir_details, calculation_meta, adjustments,
        )
        legal_proof = build_legal_proof(
            {**data, "heirs": heirs},
            net,
            gross,
            distribution,
            heir_details,
            adjustments=adjustments,
            calculation_meta=calculation_meta,
            legal_verification=legal_verification,
        )

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
            "net_estate_value": float(net),
            "heirs": heirs,
            "distribution": distribution,
            "heir_details": heir_details,
            "excluded_heirs": excluded_heirs,
            "adjustments": adjustments,
            "calculation_meta": calculation_meta,
            "legal_verification": legal_verification,
            "legal_proof": legal_proof,
        }
