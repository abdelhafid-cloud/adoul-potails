"""Extraction et sérialisation des informations du défunt (الهالك)."""

from __future__ import annotations

from typing import Any


def extract_deceased_info(data: dict) -> dict[str, str | None]:
    return {
        "name_fr": (data.get("deceased_name") or data.get("deceased_name_fr") or "").strip() or None,
        "name_ar": (data.get("deceased_name_ar") or "").strip() or None,
        "cin": (data.get("deceased_cin") or "").strip() or None,
        "death_date": (data.get("deceased_death_date") or "").strip() or None,
        "death_place": (data.get("deceased_death_place") or "").strip() or None,
        "gender": (data.get("deceased_gender") or "").strip() or None,
    }


def deceased_display_name(info: dict[str, Any] | None) -> tuple[str, str]:
    if not info:
        return "Défunt", "الهالك"
    fr = info.get("name_fr") or "Défunt"
    ar = info.get("name_ar") or "الهالك"
    return fr, ar
