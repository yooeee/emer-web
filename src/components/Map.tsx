import React, { useEffect, useState } from 'react';
import MapManager from '../utils/MapManager';
import './map.css';

const MapComponent = () => {
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // 지도 초기화
    MapManager.initialize('map');

    // 컴포넌트 언마운트 시 정리
    return () => {
      MapManager.cleanup();
    };
  }, []);

  // 내 위치 찾기 함수
  const findMyLocation = () => {
    MapManager.findMyLocation((result) => {
      if (!result.success && result.error) {
        setLocationError(result.error);
      } else {
        setLocationError(null);
      }
    });
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
