"use client";

import { Input } from "@/components/ui/input";
import { BilingualLabel } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { heirTypeGender, syncHeirPersons } from "@/lib/heir-types";
import { cn } from "@/lib/utils";
import type { HeirInput } from "@/types";

const L = dashboardLabels.pages.inheritance;

interface Props {
  heir: HeirInput;
  onChange: (heir: HeirInput) => void;
  selectClass: string;
}

export function HeirPersonFields({ heir, onChange, selectClass }: Props) {
  const persons = syncHeirPersons(heir);
  const typeGender = heirTypeGender(heir.type);

  const updatePerson = (index: number, patch: Partial<(typeof persons)[0]>) => {
    const next = syncHeirPersons(heir);
    next[index] = { ...next[index], ...patch };
    onChange({ ...heir, persons: next });
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-brand-gray/20 bg-[#fafafa] p-3">
      {persons.map((person, pi) => (
        <div key={pi} className="grid gap-2 sm:grid-cols-12 sm:items-end">
          {persons.length > 1 && (
            <p className="text-xs font-medium text-brand-slate sm:col-span-12">
              {L.heirPerson.fr} {pi + 1} / {L.heirPerson.ar} {pi + 1}
            </p>
          )}
          <div className="sm:col-span-4">
            <BilingualLabel label={L.heirName} />
            <Input
              value={person.name}
              onChange={(e) => updatePerson(pi, { name: e.target.value })}
              className="border-brand-gray/50"
              placeholder="Ex. Ahmed"
            />
          </div>
          <div className="sm:col-span-4">
            <BilingualLabel label={L.heirNameAr} />
            <Input
              dir="rtl"
              value={person.name_ar}
              onChange={(e) => updatePerson(pi, { name_ar: e.target.value })}
              className="border-brand-gray/50"
              placeholder="مثال: أحمد"
            />
          </div>
          <div className="sm:col-span-4">
            <BilingualLabel label={L.heirGender} />
            <select
              className={cn(selectClass, typeGender && "bg-white")}
              value={person.gender}
              onChange={(e) => updatePerson(pi, { gender: e.target.value as "male" | "female" })}
            >
              <option value="male">{L.heirGenderMale.fr} / {L.heirGenderMale.ar}</option>
              <option value="female">{L.heirGenderFemale.fr} / {L.heirGenderFemale.ar}</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
