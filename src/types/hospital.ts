export type FacilityType = "getEgytListInfoInqire" | "getStrmListInfoInqire";

export interface Hospital {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  coordinates: [number, number] | null;
}

export interface District {
  code: string;
  name: string;
}

export interface HospitalQuery {
  region: string;
  district: string;
  type: FacilityType;
  name: string;
}

export type SearchStatus = "idle" | "loading" | "success" | "error";

export function phoneHref(phone: string): string | undefined {
  const number = phone.replace(/[^\d+]/g, "");
  return /\d/.test(number) ? `tel:${number}` : undefined;
}
