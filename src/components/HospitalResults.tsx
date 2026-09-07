import {
  Hospital,
  HospitalQuery,
  phoneHref,
  SearchStatus,
} from "../types/hospital";
import Icon from "./Icon";

interface HospitalResultsProps {
  hospitals: Hospital[];
  status: SearchStatus;
  error: string;
  query: HospitalQuery | null;
  selectedId?: string;
  onSelect: (hospital: Hospital) => void;
  onDetails: (hospital: Hospital) => void;
  onRetry: () => void;
}

export default function HospitalResults({
  hospitals,
  status,
  error,
  query,
  selectedId,
  onSelect,
  onDetails,
  onRetry,
}: HospitalResultsProps) {
  return (
    <section
      className="results-section"
      aria-labelledby="results-heading"
      aria-busy={status === "loading"}
    >
      <div className="results-heading">
        <h2 id="results-heading">
          {status === "idle" ? "가까운 의료기관 찾기" : "검색 결과"}
          {status === "success" && <span>{hospitals.length}</span>}
        </h2>
        {status === "success" && hospitals.length > 0 && (
          <span className="sort-label">병원명순</span>
        )}
      </div>
      <p className="sr-only" role="status">
        {status === "loading"
          ? "의료기관 정보를 불러오고 있습니다."
          : status === "success"
            ? `${hospitals.length}곳의 의료기관을 찾았습니다.`
            : ""}
      </p>
      {query && (
        <p className="query-summary">
          {[
            query.region,
            query.district,
            query.type === "getEgytListInfoInqire" ? "응급실" : "외상센터",
            query.name && `“${query.name}”`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {status === "idle" && (
        <div className="initial-state">
          <div className="initial-symbol">
            <Icon name="map" width={27} height={27} />
            <span>
              <Icon name="plus" width={13} height={13} />
            </span>
          </div>
          <h3>필요한 순간, 헤매지 않도록.</h3>
          <p>
            지역을 선택하면 의료기관의 위치와
            <br />
            연락처를 한눈에 확인할 수 있어요.
          </p>
          <div className="initial-flow">
            <span>지역 선택</span>
            <Icon name="chevron" width={12} height={12} />
            <span>병원 확인</span>
            <Icon name="chevron" width={12} height={12} />
            <span>전화 연결</span>
          </div>
        </div>
      )}
      {status === "loading" && (
        <div className="skeleton-list" aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <div className="skeleton-card" key={item}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="empty-state" role="alert">
          <Icon name="info" width={30} height={30} />
          <h3>잠시 연결이 원활하지 않아요</h3>
          <p>{error}</p>
          <button className="secondary-button" onClick={onRetry} type="button">
            <Icon name="refresh" width={16} height={16} />
            다시 검색하기
          </button>
        </div>
      )}
      {status === "success" && hospitals.length === 0 && (
        <div className="empty-state">
          <Icon name="search" width={30} height={30} />
          <h3>검색된 의료기관이 없어요</h3>
          <p>
            검색 지역을 넓히거나 병원 이름을
            <br />
            다르게 입력해 보세요.
          </p>
        </div>
      )}
      {status === "success" && hospitals.length > 0 && (
        <ol className="hospital-list">
          {hospitals.map((hospital, index) => {
            const telephone =
              phoneHref(hospital.emergencyPhone) || phoneHref(hospital.phone);
            return (
              <li
                key={hospital.id}
                className={`hospital-card ${selectedId === hospital.id ? "is-selected" : ""}`}
              >
                <button
                  className="hospital-select"
                  type="button"
                  onClick={() => onSelect(hospital)}
                  aria-pressed={selectedId === hospital.id}
                  aria-label={`${hospital.name} 선택`}
                >
                  <span className="hospital-number">{index + 1}</span>
                  <span className="hospital-title">
                    <span className="hospital-category">
                      {hospital.category}
                    </span>
                    <strong>{hospital.name}</strong>
                  </span>
                  <Icon name="chevron" width={17} height={17} />
                </button>
                <p className="hospital-address">
                  <Icon name="pin" width={15} height={15} />
                  {hospital.address || "주소 정보가 제공되지 않았어요."}
                </p>
                {!hospital.coordinates && (
                  <p className="missing-location">지도 위치 정보 없음</p>
                )}
                <div className="hospital-actions">
                  <button type="button" onClick={() => onDetails(hospital)}>
                    상세정보
                    <Icon name="arrow" width={15} height={15} />
                  </button>
                  {telephone ? (
                    <a href={telephone}>
                      <Icon name="phone" width={15} height={15} />
                      전화 연결
                    </a>
                  ) : (
                    <span>전화번호 정보 없음</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
