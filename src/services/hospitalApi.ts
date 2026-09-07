import { District, Hospital, HospitalQuery } from "../types/hospital";

const apiBase = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function rowsFrom(value: unknown): unknown[] {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;
  if (isRecord(value)) return Object.keys(value).length ? [value] : [];
  throw new Error("정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");
}

export function normalizeHospitals(value: unknown): Hospital[] {
  const unique = new Map<string, Hospital>();
  rowsFrom(value).forEach((item) => {
    if (!isRecord(item) || !asText(item.dutyName)) {
      throw new Error(
        "병원 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    }
    const name = asText(item.dutyName);
    const address = asText(item.dutyAddr);
    const longitude = asText(item.wgs84Lon) ? Number(item.wgs84Lon) : NaN;
    const latitude = asText(item.wgs84Lat) ? Number(item.wgs84Lat) : NaN;
    const hasCoordinates =
      Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      Math.abs(longitude) <= 180 &&
      Math.abs(latitude) <= 90 &&
      !(longitude === 0 && latitude === 0);
    const id = asText(item.hpid) || `${name}:${address}`;
    unique.set(id, {
      id,
      name,
      address,
      category: asText(item.dutyEmclsName) || "응급의료기관",
      phone: asText(item.dutyTel1),
      emergencyPhone: asText(item.dutyTel3),
      coordinates: hasCoordinates ? [longitude, latitude] : null,
    });
  });
  return Array.from(unique.values());
}

async function getResult(
  path: string,
  params: Record<string, string>,
  signal: AbortSignal,
): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) controller.abort();
  const timeout = window.setTimeout(abort, 12000);
  try {
    const response = await fetch(
      `${apiBase}/api/${path}?${new URLSearchParams(params)}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) throw new Error("request failed");
    const body: unknown = await response.json();
    if (
      !isRecord(body) ||
      !("result" in body) ||
      (body.resultCode !== undefined && Number(body.resultCode) !== 200)
    ) {
      throw new Error("invalid response");
    }
    return body.result;
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(
      controller.signal.aborted
        ? "응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요."
        : "정보를 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.",
    );
  } finally {
    window.clearTimeout(timeout);
    signal.removeEventListener("abort", abort);
  }
}

export async function getDistricts(
  regionCode: string,
  signal: AbortSignal,
): Promise<District[]> {
  const result = await getResult("sigungu", { siCd: regionCode }, signal);
  return rowsFrom(result).map((item) => {
    if (
      !isRecord(item) ||
      !asText(item.admCode) ||
      !asText(item.lowestAdmCodeNm)
    ) {
      throw new Error("지역 정보를 확인하지 못했어요.");
    }
    return { code: asText(item.admCode), name: asText(item.lowestAdmCodeNm) };
  });
}

export async function searchHospitals(
  query: HospitalQuery,
  signal: AbortSignal,
): Promise<Hospital[]> {
  const result = await getResult(
    "search",
    {
      Q0: query.region,
      Q1: query.district,
      QN: query.name.trim(),
      type: query.type,
      pageNo: "1",
      numOfRows: "999",
    },
    signal,
  );
  return normalizeHospitals(result);
}
