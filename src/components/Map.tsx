import React, { useEffect, useState } from 'react';
import MapManager from '../utils/MapManager';
import '../assets/map.css';

const MapComponent = ({searchResult}: {searchResult: any}) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [map, setMap] = useState<MapManager | null>(null);

  useEffect(() => {
    // 지도 초기화 및 MapManager 인스턴스 상태로 저장
    const instance = new MapManager();
    instance.initialize('map');
    setMap(instance);

    // 컴포넌트 언마운트 시 정리
    return () => {
      instance.cleanup();
    };
  }, []);

  useEffect(() => {
    if (map && searchResult.length > 0) {
      map.drawMarker(searchResult);
    }
  }, [searchResult, map]);

  // 내 위치 찾기 함수
  const findMyLocation = () => {
    if (map) {
      map.findMyLocation((result) => {
        if (!result.success && result.error) {
          setLocationError(result.error);
        } else {
          setLocationError(null);
        }
      });
    }
  };

  return (
    <div className="map-container">
      <div id="map" className="map" />
      <button
        className="location-button"
        onClick={findMyLocation}
        aria-label="내 위치 찾기"
        title="내 위치 찾기"
      >
        <div className="location-icon"></div>
      </button>
      {locationError && (
        <div className="location-error">
          {locationError}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
