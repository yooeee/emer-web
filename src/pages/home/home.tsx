import { useState } from "react";
import HospitalSearch from "../../components/HospitalSearch";
import HospitalResults from "../../components/HospitalResults";
import HospitalMap from "../../components/HospitalMap";
import HospitalDetails from "../../components/HospitalDetails";
import ServiceGuide from "../../components/ServiceGuide";
import Icon from "../../components/Icon";
import useHospitalSearch from "../../hooks/useHospitalSearch";
import { Hospital, HospitalQuery } from "../../types/hospital";
import "./home.css";

export default function Home() {
  const { hospitals, status, error, query, search, reset } =
    useHospitalSearch();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  );
  const [detailHospital, setDetailHospital] = useState<Hospital | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const submit = (nextQuery: HospitalQuery) => {
    setSelectedHospital(null);
    void search(nextQuery);
  };
  const selectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    if (hospital.coordinates) setMobileView("map");
    else setDetailHospital(hospital);
  };

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#hospital-search"
        onClick={() => setMobileView("list")}
      >
        의료기관 검색으로 건너뛰기
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="EMER 홈">
          <span className="brand-symbol">
            <Icon name="pulse" width={25} height={25} />
          </span>
          <span className="brand-wordmark">
            emer<span>.</span>
          </span>
          <span className="brand-tagline">
            도움이 필요한 순간,
            <br />
            가장 가까이.
          </span>
        </a>
        <div className="header-current">
          <span />
          응급의료기관 찾기
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="guide-button"
            onClick={() => setShowGuide(true)}
          >
            <Icon name="info" width={17} height={17} />
            <span>이용 안내</span>
          </button>
          <a href="tel:119" className="emergency-call">
            <Icon name="phone" width={17} height={17} />
            <span>응급상황</span>
            <strong>119</strong>
          </a>
        </div>
      </header>
      <div
        className="mobile-view-switch"
        role="group"
        aria-label="화면 보기 방식"
      >
        <button
          type="button"
          aria-pressed={mobileView === "list"}
          onClick={() => setMobileView("list")}
        >
          <Icon name="list" width={18} height={18} />
          검색 · 목록{status === "success" && <span>{hospitals.length}</span>}
        </button>
        <button
          type="button"
          aria-pressed={mobileView === "map"}
          onClick={() => setMobileView("map")}
        >
          <Icon name="map" width={18} height={18} />
          지도 보기
        </button>
      </div>
      <main className={`workspace view-${mobileView}`}>
        <aside
          className="search-panel"
          id="hospital-search"
          aria-label="의료기관 검색 및 목록"
          tabIndex={-1}
        >
          <div className="panel-intro">
            <div className="intro-eyebrow">
              <span />
              EMERGENCY CARE FINDER
            </div>
            <h1>
              필요한 순간,
              <br />
              가까운 응급의료기관.
            </h1>
            <p>위치부터 연락처까지, 한곳에서 확인하세요.</p>
          </div>
          <HospitalSearch
            loading={status === "loading"}
            onSearch={submit}
            onReset={() => {
              reset();
              setSelectedHospital(null);
            }}
          />
          <HospitalResults
            hospitals={hospitals}
            status={status}
            error={error}
            query={query}
            selectedId={selectedHospital?.id}
            onSelect={selectHospital}
            onDetails={setDetailHospital}
            onRetry={() => {
              if (query) submit(query);
            }}
          />
          <div className="panel-footer">
            <Icon name="info" width={15} height={15} />
            <p>
              진료·수용 가능 여부는 방문 전<br />
              의료기관에 전화로 확인해 주세요.
            </p>
          </div>
        </aside>
        <HospitalMap
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          query={query}
          status={status}
          onSelect={setSelectedHospital}
          onDetails={setDetailHospital}
          onClearSelection={() => setSelectedHospital(null)}
        />
      </main>
      <footer className="site-footer">
        <span>
          <strong>emer.</strong> © {new Date().getFullYear()} EMER
        </span>
        <p>당신에게 필요한 정보가, 필요한 순간에 닿도록.</p>
        <button type="button" onClick={() => setShowGuide(true)}>
          서비스 안내
          <Icon name="info" width={12} height={12} />
        </button>
      </footer>
      {detailHospital && (
        <HospitalDetails
          hospital={detailHospital}
          onClose={() => setDetailHospital(null)}
        />
      )}
      {showGuide && <ServiceGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
