import { api } from "@/services/api";

export type MoroccanCity = {
  code: string;
  fr: string;
  ar: string;
};

/** Charge la liste depuis le backend (source unique : moroccan_cities.py) */
export async function fetchMoroccanCities(): Promise<MoroccanCity[]> {
  const { data } = await api.get<MoroccanCity[]>("/auth/cities");
  return data;
}

export function cityLabel(city: MoroccanCity): string {
  return `${city.fr} / ${city.ar}`;
}
