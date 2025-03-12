import React, { useEffect, useState } from 'react';
import MapManager from '../utils/MapManager';
import '../assets/map.css';

const MapComponent = ({searchResult}: {searchResult: any}) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [map, setMap] = useState<MapManager | null>(null);

  useEffect(() => {

    const map = new MapManager();
    map.initialize('map');
    setMap(map);

    // 컴포넌트 언마운트 시 정리
    return () => {
      map.cleanup();
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
