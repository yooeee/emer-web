import { useCallback, useEffect, useRef, useState } from "react";
import { searchHospitals } from "../services/hospitalApi";
import { Hospital, HospitalQuery, SearchStatus } from "../types/hospital";

export default function useHospitalSearch() {
  const request = useRef<AbortController | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState<HospitalQuery | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  const search = useCallback(async (nextQuery: HospitalQuery) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setQuery(nextQuery);
    setStatus("loading");
    setHospitals([]);
    setError("");
    try {
      const result = await searchHospitals(nextQuery, controller.signal);
      if (controller.signal.aborted) return;
      setHospitals(result.sort((a, b) => a.name.localeCompare(b.name, "ko")));
      setStatus("success");
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(
        cause instanceof Error
          ? cause.message
          : "검색 중 문제가 발생했어요. 다시 시도해 주세요.",
      );
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    request.current?.abort();
    setHospitals([]);
    setQuery(null);
    setError("");
    setStatus("idle");
  }, []);
  return { hospitals, status, error, query, search, reset };
}
