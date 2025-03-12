import React, { useEffect, useState } from 'react';
import MapManager from '../utils/MapManager';
import HospitalModal from './HospitalModal';
import '../assets/map.css';

const MapComponent = ({searchResult}: {searchResult: any}) => {
  const [locationError, setLocationError] = useState<string | null>(null);
  const [map, setMap] = useState<MapManager | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);

  useEffect(() => {
    const mapManager = new MapManager();
    mapManager.initialize('map');
    
    // 병원 선택 이벤트 핸들러 설정
    mapManager.onHospitalSelect = (hospital) => {
      setSelectedHospital(hospital);
    };
    
    setMap(mapManager);

    // 컴포넌트 언마운트 시 정리
    return () => {
      mapManager.cleanup();
    };
  }, []);

  useEffect(() => {
    if (map && searchResult && searchResult.length > 0) {
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

  // 모달 닫기
  const closeModal = () => {
    setSelectedHospital(null);
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
      
      {selectedHospital && (
        <HospitalModal 
          hospital={selectedHospital} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default MapComponent;
