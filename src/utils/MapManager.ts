import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Tile, Vector, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import { createRoot } from 'react-dom/client';
import MarkerPopup from '../components/MarkerPopup';
import React from 'react';

export interface LocationResult {
  success: boolean;
  error?: string;
}

export type LocationCallback = (result: LocationResult) => void;
export type HospitalSelectCallback = (hospital: any) => void;

class MapManager {
  private map: Map | null = null;
  private locationLayer: VectorLayer<VectorSource> | null = null;
  private markerLayer: VectorLayer<VectorSource> | null = null;
  private popupOverlays: Overlay[] = [];
  
  // 병원 선택 콜백 추가
  public onHospitalSelect: HospitalSelectCallback | null = null;
  
  /**
   * 지도 초기화
   * @param target 지도를 렌더링할 HTML 요소의 ID
   * @returns 생성된 OpenLayers Map 인스턴스
   */
  initialize(target: string): Map {
    const baseMap = new XYZ({
        url: "http://api.vworld.kr/req/wmts/1.0.0/4C6017C6-7F0A-39CF-97F0-730F1490130E/Base/{z}/{y}/{x}.png",
        crossOrigin: 'anonymous',
        transition: 0,
    });
    
    this.map = new Map({
      target,
      layers: [
        new Tile({
            source: baseMap,
            preload: 20,
        }),
      ],
      view: new View({
        center: fromLonLat([127.550, 35.871]), // 대구 중심으로 설정
        zoom: 7.5,
      }),
      controls: defaultControls({ zoom: false }), // 줌 컨트롤 제거
    });

    return this.map;
  }

  /**
   * 지도 인스턴스 반환
   * @returns 현재 지도 인스턴스
   */
  getMap(): Map | null {
    return this.map;
  }

  /**
   * 지도 정리 (컴포넌트 언마운트 시 호출)
   */
  cleanup(): void {
    if (this.map) {
      this.removePopupOverlays();
      this.map.setTarget(undefined);
      this.map = null;
    }
  }

  /**
   * 마커 그리기
   * @param searchResult 검색 결과
   */
  drawMarker(searchResult: any): void {
    const map = this.map;
    const markerVectorSource = new VectorSource();

    if (!map) return;

    this.removeLayer('marker');
    this.removePopupOverlays();

    searchResult.forEach((item: any) => {
      const location = fromLonLat([parseFloat(item.wgs84Lon), parseFloat(item.wgs84Lat)]);
      const markerFeature = new Feature({
        geometry: new Point(location),
        name: "marker",
        properties: item
      });
      
      markerFeature.setStyle(new Style({
        image: new Icon({
          src: '/assets/images/marker.png',
          scale: 0.05,
        }),
      }));

      markerVectorSource.addFeature(markerFeature);
      
      // 병원 정보 팝업 생성
      this.createHospitalPopup(item, location);
    });

    this.markerLayer = new VectorLayer({
      source: markerVectorSource,
    });
    this.markerLayer.set('name', 'marker');

    // 마커 클릭 이벤트 추가
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature && feature.get('name') === 'marker') {
        const properties = feature.get('properties');
        if (this.onHospitalSelect) {
          this.onHospitalSelect(properties);
        }
      }
    });

    // 검색결과 마커로 이동
    const extent = markerVectorSource.getExtent();
    map.getView().fit(extent, {
      padding: [100, 100, 100, 100],
      maxZoom: 14,
      duration: 500,
    });

    // 지도에 마커 표시
    map.addLayer(this.markerLayer);
  }

  /**
   * 병원 정보 팝업 생성
   * @param hospital 병원 정보
   * @param location 위치 좌표
   */
  private createHospitalPopup(hospital: any, location: number[]): void {
    if (!this.map) return;
    
    // 팝업 요소 생성
    const popupElement = document.createElement('div');
    popupElement.className = 'popup-container';
    
    // 클릭 이벤트 추가
    popupElement.addEventListener('click', () => {
      if (this.onHospitalSelect) {
        this.onHospitalSelect(hospital);
      }
    });
    
    // React 컴포넌트 렌더링
    const root = createRoot(popupElement);
    root.render(React.createElement(MarkerPopup, { hospital }));
    
    // 오버레이 생성
    const popup = new Overlay({
      element: popupElement,
      position: location,
      positioning: 'bottom-center',
      stopEvent: false
    });
    
    // 지도에 오버레이 추가
    this.map.addOverlay(popup);
    this.popupOverlays.push(popup);
  }
  
  /**
   * 팝업 오버레이 제거
   */
  private removePopupOverlays(): void {
    if (!this.map) return;
    
    this.popupOverlays.forEach(overlay => {
      this.map!.removeOverlay(overlay);
    });
    
    this.popupOverlays = [];
  }

  /**
   * 사용자의 현재 위치 찾기
   * @param callback 위치 찾기 결과를 처리할 콜백 함수
   */
  findMyLocation(callback: LocationCallback): void {
    if (!this.map) {
      callback({ success: false, error: '지도가 초기화되지 않았습니다.' });
      return;
    }

    if (!navigator.geolocation) {
      callback({ success: false, error: '브라우저가 위치 정보를 지원하지 않습니다.' });
      return;
    }

    // 이 시점에서 this.map은 null이 아님이 보장됨
    const map = this.map;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const location = fromLonLat([longitude, latitude]);

        // 기존 위치 레이어 제거
        this.removeLocationLayer();

        // 새 위치 레이어 추가
        const locationFeature = new Feature({
          geometry: new Point(location),
        });

        const vectorSource = new VectorSource({
          features: [locationFeature],
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({
                color: '#3182f6',
              }),
              stroke: new Stroke({
                color: '#ffffff',
                width: 2,
              }),
            }),
          }),
        });

        vectorLayer.set('name', 'locationLayer');
        this.locationLayer = vectorLayer;
        map.addLayer(vectorLayer);

        // 지도 이동
        map.getView().animate({
          center: location,
          zoom: 15,
          duration: 1000,
        });

        callback({ success: true });
      },
      (error) => {
        let errorMessage = '알 수 없는 오류가 발생했습니다.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
        
        callback({ success: false, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }
  

  /**
   * 위치 레이어 제거
   */
  private removeLocationLayer(): void {
    if (this.map && this.locationLayer) {
      this.map.removeLayer(this.locationLayer);
      this.locationLayer = null;
    }
  }

  private removeLayer(name: string) : void {
    const map = this.map;
    if(!map) return;

    map.getAllLayers().forEach((layer) => {
      if(layer.get('name') === name) {
        map.removeLayer(layer);
      }
    }); 
  }
}

// 싱글톤 인스턴스 대신 클래스 자체를 내보냅니다
export default MapManager; 