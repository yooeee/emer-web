import { FormEvent, useEffect, useState } from "react";
import { regions } from "../data/regions";
import { getDistricts } from "../services/hospitalApi";
import { District, FacilityType, HospitalQuery } from "../types/hospital";
import Icon from "./Icon";

interface HospitalSearchProps {
  loading: boolean;
  onSearch: (query: HospitalQuery) => void;
  onReset: () => void;
}

export default function HospitalSearch({
  loading,
  onSearch,
  onReset,
}: HospitalSearchProps) {
  const [regionCode, setRegionCode] = useState("");
  const [district, setDistrict] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState(false);
  const [districtRetry, setDistrictRetry] = useState(0);
  const [type, setType] = useState<FacilityType>("getEgytListInfoInqire");
  const [name, setName] = useState("");
  const [validation, setValidation] = useState("");

  useEffect(() => {
    setDistricts([]);
    setDistrictError(false);
    if (!regionCode) {
      setDistrictLoading(false);
      return;
    }
    const controller = new AbortController();
    setDistrictLoading(true);
    getDistricts(regionCode, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setDistricts(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDistrictError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDistrictLoading(false);
      });
    return () => controller.abort();
  }, [regionCode, districtRetry]);

  const changeRegion = (code: string) => {
    setRegionCode(code);
    setDistrict("");
    setValidation("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const region = regions.find((item) => item.code === regionCode);
    if (!region) {
      setValidation("찾으실 시·도를 먼저 선택해 주세요.");
      document.getElementById("region")?.focus();
      return;
    }
    setValidation("");
    onSearch({ region: region.name, district, type, name: name.trim() });
  };
  const reset = () => {
    changeRegion("");
    setType("getEgytListInfoInqire");
    setName("");
    onReset();
  };

  return (
    <form
      className="search-form"
      onSubmit={submit}
      noValidate
      aria-label="의료기관 검색"
    >
      <fieldset className="facility-options">
        <legend className="sr-only">의료기관 종류</legend>
        <label className={type === "getEgytListInfoInqire" ? "selected" : ""}>
          <input
            type="radio"
            name="facility"
            value="getEgytListInfoInqire"
            checked={type === "getEgytListInfoInqire"}
            onChange={() => setType("getEgytListInfoInqire")}
          />
          <Icon name="hospital" />
          응급실
        </label>
        <label className={type === "getStrmListInfoInqire" ? "selected" : ""}>
          <input
            type="radio"
            name="facility"
            value="getStrmListInfoInqire"
            checked={type === "getStrmListInfoInqire"}
            onChange={() => setType("getStrmListInfoInqire")}
          />
          <Icon name="pulse" />
          외상센터
        </label>
      </fieldset>
      <div className="field-heading">
        <span>어디에서 찾으시나요?</span>
        <button
          className="text-button reset-button"
          type="button"
          onClick={reset}
        >
          <Icon name="refresh" width={14} height={14} />
          초기화
        </button>
      </div>
      <div className="region-fields">
        <div className="form-field">
          <label htmlFor="region">
            시·도 <span aria-hidden="true">*</span>
          </label>
          <div className="select-wrap">
            <select
              id="region"
              value={regionCode}
              onChange={(event) => changeRegion(event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(validation)}
              aria-describedby={validation ? "region-validation" : undefined}
            >
              <option value="">시·도 선택</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            <Icon name="chevron" />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="district">시·군·구</label>
          <div className="select-wrap">
            <select
              id="district"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              disabled={!regionCode || districtLoading || districtError}
            >
              <option value="">
                {districtLoading ? "불러오는 중…" : "전체 지역"}
              </option>
              {districts.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <Icon name="chevron" />
          </div>
        </div>
      </div>
      {validation && (
        <p id="region-validation" className="field-error" role="alert">
          {validation}
        </p>
      )}
      {districtError && (
        <div className="district-notice" role="status">
          세부 지역을 불러오지 못했어요. 시·도 전체 검색은 가능해요.
          <button
            className="text-button"
            type="button"
            onClick={() => setDistrictRetry((value) => value + 1)}
          >
            다시 불러오기
          </button>
        </div>
      )}
      <div className="form-field name-field">
        <label htmlFor="hospital-name">
          병원 이름 <span className="optional">선택</span>
        </label>
        <div className="input-wrap">
          <Icon name="search" />
          <input
            id="hospital-name"
            type="search"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="찾으시는 병원이 있나요?"
            autoComplete="off"
            maxLength={100}
          />
        </div>
      </div>
      <button
        className="primary-button search-button"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            의료기관 찾는 중
          </>
        ) : (
          <>
            <Icon name="search" />
            의료기관 찾기
            <Icon
              className="search-arrow"
              name="arrow"
              width={18}
              height={18}
            />
          </>
        )}
      </button>
      <div className="quick-regions">
        <span>빠른 지역 선택</span>
        {[
          { code: "11", name: "서울" },
          { code: "26", name: "부산" },
          { code: "28", name: "인천" },
          { code: "41", name: "경기" },
        ].map((item) => (
          <button
            type="button"
            key={item.code}
            onClick={() => changeRegion(item.code)}
            aria-pressed={regionCode === item.code}
          >
            {item.name}
          </button>
        ))}
      </div>
    </form>
  );
}
