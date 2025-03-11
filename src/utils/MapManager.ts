import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Tile, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';

export interface LocationResult {
  success: boolean;
  error?: string;
}

export type LocationCallback = (result: LocationResult) => void;

class MapManager {
  private map: Map | null = null;
  private locationLayer: VectorLayer<VectorSource> | null = null;

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
      this.map.setTarget(undefined);
      this.map = null;
    }
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
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new MapManager(); 