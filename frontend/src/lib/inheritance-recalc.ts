import type { HeirInput, InheritanceCalculation, WasiyyahResult } from "@/types";

export function buildInheritanceRecalcPayload(
  calculation: InheritanceCalculation,
  heirs: HeirInput[],
) {
  const deceased = calculation.deceased_info ?? calculation.legal_proof?.deceased ?? {};
  const wasiyyah = (calculation.wasiyyah ?? calculation.legal_proof?.wasiyyah) as WasiyyahResult | undefined;
  const wasiyyahAmount = wasiyyah?.wasiyyah_amount_requested ?? wasiyyah?.wasiyyah_amount_applied ?? 0;

  return {
    title: calculation.title,
    dossier_id: calculation.dossier_id,
    total_estate_value: calculation.total_estate_value,
    real_estate_value: calculation.real_estate_value,
    bank_accounts_value: calculation.bank_accounts_value,
    debts: calculation.debts,
    fees: calculation.fees,
    deceased_name: deceased.name_fr ?? "",
    deceased_name_ar: deceased.name_ar ?? "",
    deceased_cin: deceased.cin ?? "",
    deceased_death_date: deceased.death_date ?? "",
    deceased_death_place: deceased.death_place ?? "",
    deceased_gender: deceased.gender ?? "male",
    heirs,
    has_wasiyyah: wasiyyahAmount > 0,
    ...(wasiyyahAmount > 0
      ? {
          wasiyyah_amount: wasiyyahAmount,
          wasiyyah_kind: wasiyyah?.wasiyyah_kind ?? "cash",
          legatee_name: wasiyyah?.legatee_name ?? "",
          legatee_name_ar: wasiyyah?.legatee_name_ar ?? "",
          legatee_is_heir: wasiyyah?.legatee_is_heir ?? false,
          heirs_consent: wasiyyah?.heirs_consent ?? false,
        }
      : {}),
  };
}
