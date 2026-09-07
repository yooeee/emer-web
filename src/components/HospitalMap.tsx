import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { regions } from "../data/regions";
import { Hospital, HospitalQuery, SearchStatus } from "../types/hospital";
import HospitalMapController from "../utils/HospitalMapController";
import Icon from "./Icon";

interface HospitalMapProps {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  query: HospitalQuery | null;
  status: SearchStatus;
  onSelect: (hospital: Hospital) => void;
  onDetails: (hospital: Hospital) => void;
  onClearSelection: () => void;
}

export default function HospitalMap({
  hospitals,
  selectedHospital,
  query,
  status,
  onSelect,
  onDetails,
  onClearSelection,
}: HospitalMapProps) {
  const target = useRef<HTMLDivElement>(null);
  const controller = useRef<HospitalMapController | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [tileError, setTileError] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    if (!target.current) return;
    try {
      controller.current = new HospitalMapController(
        target.current,
        (hospital) => select.current(hospital),
        setTileError,
      );
    } catch {
      setMapError(true);
    }
    return () => {
      mounted.current = false;
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === "idle" || status === "loading")
      controller.current?.focusRegion(
        regions.find((region) => region.name === query?.region)?.center,
      );
  }, [query, status]);
  useEffect(() => {
    controller.current?.setHospitals(hospitals);
  }, [hospitals]);
  useEffect(() => {
    controller.current?.selectHospital(selectedHospital);
  }, [selectedHospital]);

  const locate = async () => {
    if (!controller.current || locating) return;
    setLocating(true);
    setLocationMessage("");
    try {
      await controller.current.locate();
      if (mounted.current)
        setLocationMessage(
          "내 위치를 표시했어요. 병원 검색은 검색 패널에서 지역을 선택해 주세요.",
        );
    } catch (error) {
      if (mounted.current)
        setLocationMessage(
          error instanceof Error ? error.message : "위치를 확인하지 못했어요.",
        );
    } finally {
      if (mounted.current) setLocating(false);
    }
  };

  return (
    <section className="map-workspace" aria-label="의료기관 지도">
      <div
        ref={target}
        className="hospital-map"
        tabIndex={0}
        role="region"
        aria-label="의료기관 위치 지도. 방향키로 이동하고 더하기, 빼기 키로 확대와 축소할 수 있습니다."
      />
      <div className="map-heading">
        <span className="map-heading-icon">
          <Icon name="map" width={19} height={19} />
        </span>
        <div>
          <strong>
            {query
              ? `${query.region}${query.district ? ` ${query.district}` : ""}`
              : "대한민국 응급의료기관 지도"}
          </strong>
          <span>
            {status === "success"
              ? `검색된 ${hospitals.length}곳 중 ${hospitals.filter((hospital) => hospital.coordinates).length}곳을 지도에 표시`
              : "필요한 의료기관을 더 쉽게 찾아보세요"}
          </span>
        </div>
        {status === "loading" && <span className="spinner" />}
      </div>
      {!mapError && (
        <div className="map-controls" aria-label="지도 조작">
          <div className="zoom-controls">
            <button
              type="button"
              className="icon-button"
              onClick={() => controller.current?.zoom(1)}
              aria-label="지도 확대"
              title="확대"
            >
              <Icon name="plus" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => controller.current?.zoom(-1)}
              aria-label="지도 축소"
              title="축소"
            >
              <Icon name="minus" />
            </button>
          </div>
          <button
            type="button"
            className="icon-button map-control"
            onClick={locate}
            disabled={locating}
            aria-label="내 위치 찾기"
            title="내 위치 찾기"
          >
            {locating ? <span className="spinner" /> : <Icon name="location" />}
          </button>
          <button
            type="button"
            className="icon-button map-control"
            onClick={() => {
              onClearSelection();
              hospitals.some((hospital) => hospital.coordinates)
                ? controller.current?.fitResults()
                : controller.current?.focusRegion(
                    regions.find((region) => region.name === query?.region)
                      ?.center,
                  );
            }}
            aria-label="지도 전체 보기"
            title="전체 보기"
          >
            <Icon name="expand" />
          </button>
        </div>
      )}
      {(tileError || mapError) && (
        <div className="map-error" role="alert">
          <Icon name="info" />
          <div>
            <strong>지도를 불러오지 못했어요</strong>
            <p>병원 목록에서 주소와 전화번호를 확인할 수 있어요.</p>
            {!mapError && (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setTileError(false);
                  controller.current?.retryTiles();
                }}
              >
                지도 다시 불러오기
              </button>
            )}
          </div>
        </div>
      )}
      {locationMessage && (
        <div className="map-toast" role="status">
          <Icon name="location" />
          <span>{locationMessage}</span>
          <button
            className="icon-button"
            onClick={() => setLocationMessage("")}
            type="button"
            aria-label="위치 안내 닫기"
          >
            <Icon name="close" width={16} height={16} />
          </button>
        </div>
      )}
      {selectedHospital ? (
        <div className="map-selection">
          <div className="selection-heading">
            <span className="selection-icon">
              <Icon name="hospital" width={23} height={23} />
            </span>
            <div>
              <span className="hospital-category">
                {selectedHospital.category}
              </span>
              <strong>{selectedHospital.name}</strong>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={onClearSelection}
              aria-label="병원 선택 해제"
            >
              <Icon name="close" width={17} height={17} />
            </button>
          </div>
          <p>{selectedHospital.address || "주소 정보가 제공되지 않았어요."}</p>
          <button
            type="button"
            className="selection-detail"
            onClick={() => onDetails(selectedHospital)}
          >
            상세정보 및 연락처
            <Icon name="arrow" width={17} height={17} />
          </button>
        </div>
      ) : (
        <div className="map-tip">
          <span className="tip-icon">
            <Icon name="pin" width={22} height={22} />
          </span>
          <div>
            <strong>
              {hospitals.length
                ? "지도 위 번호를 선택해 보세요"
                : "가까운 곳에서, 필요한 도움을."}
            </strong>
            <p>
              {hospitals.length
                ? "병원 위치와 상세정보를 확인할 수 있어요."
                : "지역을 검색하면 의료기관이 지도에 표시돼요."}
            </p>
          </div>
        </div>
      )}
      <div className="map-legend">
        <span>
          <i />
          의료기관
        </span>
        <span>
          <i className="location-dot" />내 위치
        </span>
      </div>
    </section>
  );
}
