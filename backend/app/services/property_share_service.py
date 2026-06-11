from decimal import Decimal, ROUND_HALF_UP


class PropertyShareService:
    @staticmethod
    def calculate(data: dict) -> dict:
        properties = data.get("properties", [])
        heirs = data.get("heirs", [])

        if not properties:
            raise ValueError("Ajoutez au moins un bien immobilier.")
        if not heirs:
            raise ValueError("Ajoutez au moins un héritier.")

        total_value = sum(
            Decimal(str(p.get("value", 0))) for p in properties
        )
        if total_value <= 0:
            raise ValueError("La valeur totale des biens doit être supérieure à zéro.")

        shares = PropertyShareService._resolve_shares(heirs)

        distribution = []
        for heir, share_pct in zip(heirs, shares):
            amount = (total_value * Decimal(str(share_pct)) / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            distribution.append({
                "heir_id": heir.get("id"),
                "name": heir.get("name", "Héritier"),
                "share_percentage": float(share_pct),
                "amount": float(amount),
                "assigned_value": 0.0,
                "properties_assigned": [],
            })

        PropertyShareService._assign_properties(properties, distribution)
        soultes = PropertyShareService._compute_soultes(distribution)

        for d in distribution:
            d["balance"] = round(d["assigned_value"] - d["amount"], 2)
            d.pop("assigned_value", None)

        return {
            "total_value": float(total_value),
            "properties": properties,
            "heirs": heirs,
            "distribution": distribution,
            "soultes": soultes,
        }

    @staticmethod
    def _resolve_shares(heirs: list) -> list[Decimal]:
        raw = [heir.get("share_percentage") for heir in heirs]
        if any(r is not None and r != "" for r in raw):
            values = [Decimal(str(r or 0)) for r in raw]
            total = sum(values)
            if total <= 0:
                raise ValueError("Les parts des héritiers doivent être supérieures à zéro.")
            diff = abs(total - Decimal("100"))
            if diff > Decimal("0.05"):
                raise ValueError(
                    f"La somme des parts doit être 100 % (actuellement {float(total):.2f} %)."
                )
            return values
        equal = (Decimal("100") / len(heirs)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        shares = [equal] * len(heirs)
        remainder = Decimal("100") - sum(shares)
        if remainder != 0:
            shares[0] += remainder
        return shares

    @staticmethod
    def _assign_properties(properties: list, distribution: list) -> None:
        sorted_props = sorted(
            properties,
            key=lambda p: Decimal(str(p.get("value", 0))),
            reverse=True,
        )
        for prop in sorted_props:
            prop_value = float(Decimal(str(prop.get("value", 0))))
            if prop_value <= 0:
                continue
            best = max(
                distribution,
                key=lambda d: d["amount"] - d["assigned_value"],
            )
            best["properties_assigned"].append({
                "property_id": prop.get("id"),
                "name": prop.get("name"),
                "type": prop.get("type"),
                "surface_m2": prop.get("surface_m2"),
                "value": prop_value,
            })
            best["assigned_value"] += prop_value

    @staticmethod
    def _compute_soultes(distribution: list) -> list:
        soultes = []
        for d in distribution:
            diff = d["assigned_value"] - d["amount"]
            if abs(diff) <= 0.01:
                continue
            for prop in d["properties_assigned"]:
                soultes.append({
                    "from": d["name"],
                    "property": prop.get("name", ""),
                    "property_type": prop.get("type"),
                    "amount": round(abs(diff), 2),
                    "type": "receive" if diff > 0 else "pay",
                    "note": (
                        "Excédent de valeur assignée"
                        if diff > 0
                        else "Déficit — soulte à recevoir"
                    ),
                })
                break
        return soultes
