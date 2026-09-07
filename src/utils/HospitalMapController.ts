import Map from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { Hospital } from "../types/hospital";

export default class HospitalMapController {
  private readonly map: Map;
  private readonly hospitals = new VectorSource<Feature<Point>>();
  private readonly location = new VectorSource<Feature<Point>>();
  private readonly tiles = new OSM({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  });
  private readonly resizeObserver: ResizeObserver;
  private selectedId?: string;
  private disposed = false;
  private pendingFit = false;
  private readonly markerStyles = new globalThis.Map<string, Style>();
  private readonly duration = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
    ? 0
    : 350;

  constructor(
    target: HTMLElement,
    onSelect: (hospital: Hospital) => void,
    onTileError: (failed: boolean) => void,
  ) {
    const hospitalLayer = new VectorLayer({
      source: this.hospitals,
      style: (feature) =>
        this.markerStyle(
          String(feature.get("number")),
          feature.getId() === this.selectedId,
        ),
      zIndex: 2,
    });
    this.map = new Map({
      target,
      layers: [
        new TileLayer({ source: this.tiles, preload: 0 }),
        new VectorLayer({
          source: this.location,
          zIndex: 3,
          style: new Style({
            image: new Circle({
              radius: 8,
              fill: new Fill({ color: "#367fe8" }),
              stroke: new Stroke({ color: "#fff", width: 3 }),
            }),
          }),
        }),
        hospitalLayer,
      ],
      view: new View({
        center: fromLonLat([127.6, 36.1]),
        zoom: 7.2,
        minZoom: 6,
        maxZoom: 19,
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attributionOptions: { collapsible: false },
      }),
    });
    this.tiles.on("tileloaderror", () => onTileError(true));
    this.map.on("singleclick", (event) => {
      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (item) => item,
        { layerFilter: (layer) => layer === hospitalLayer, hitTolerance: 8 },
      );
      const hospital = feature?.get("hospital") as Hospital | undefined;
      if (hospital) onSelect(hospital);
    });
    this.map.on("pointermove", (event) => {
      if (!event.dragging)
        target.style.cursor = this.map.hasFeatureAtPixel(event.pixel, {
          layerFilter: (layer) => layer === hospitalLayer,
          hitTolerance: 5,
        })
          ? "pointer"
          : "";
    });
    this.resizeObserver = new ResizeObserver(() => {
      this.map.updateSize();
      if (this.pendingFit) this.fitResults();
    });
    this.resizeObserver.observe(target);
  }

  private markerStyle(number: string, selected: boolean): Style {
    const key = `${number}:${selected}`;
    let style = this.markerStyles.get(key);
    if (!style) {
      style = new Style({
        image: new Circle({
          radius: selected ? 21 : 17,
          fill: new Fill({ color: selected ? "#173e35" : "#fff" }),
          stroke: new Stroke({
            color: selected ? "#b6e5cc" : "#326c58",
            width: selected ? 4 : 2,
          }),
        }),
        text: new Text({
          text: number,
          font: "600 13px system-ui, sans-serif",
          fill: new Fill({ color: selected ? "#fff" : "#173e35" }),
        }),
        zIndex: selected ? 10 : 1,
      });
      this.markerStyles.set(key, style);
    }
    return style;
  }

  setHospitals(hospitals: Hospital[]) {
    this.hospitals.clear();
    this.markerStyles.clear();
    this.hospitals.addFeatures(
      hospitals.flatMap((hospital, index) => {
        if (!hospital.coordinates) return [];
        const feature = new Feature({
          geometry: new Point(fromLonLat(hospital.coordinates)),
          hospital,
          number: index + 1,
        });
        feature.setId(hospital.id);
        return [feature];
      }),
    );
    this.fitResults();
  }

  selectHospital(hospital: Hospital | null) {
    this.selectedId = hospital?.id;
    this.hospitals.changed();
    if (hospital?.coordinates) {
      this.pendingFit = false;
      this.map
        .getView()
        .animate({
          center: fromLonLat(hospital.coordinates),
          zoom: Math.max(this.map.getView().getZoom() || 13, 14),
          duration: this.duration,
        });
    }
  }

  fitResults() {
    if (this.hospitals.isEmpty()) {
      this.pendingFit = false;
      return;
    }
    this.map.updateSize();
    const size = this.map.getSize();
    if (!size || size[0] === 0 || size[1] === 0) {
      this.pendingFit = true;
      return;
    }
    this.pendingFit = false;
    const horizontal = Math.min(65, size[0] * 0.15);
    this.map.getView().fit(this.hospitals.getExtent(), {
      padding: [
        Math.min(100, size[1] * 0.18),
        horizontal,
        Math.min(160, size[1] * 0.28),
        horizontal,
      ],
      maxZoom: 14,
      duration: this.duration,
    });
  }

  focusRegion(center?: readonly [number, number]) {
    this.pendingFit = false;
    this.map
      .getView()
      .animate({
        center: fromLonLat(center ? [...center] : [127.6, 36.1]),
        zoom: center ? 10 : 7.2,
        duration: this.duration,
      });
  }

  zoom(delta: number) {
    this.map
      .getView()
      .animate({
        zoom: (this.map.getView().getZoom() || 7) + delta,
        duration: this.duration,
      });
  }
  retryTiles() {
    this.tiles.refresh();
  }

  async locate(): Promise<void> {
    if (!navigator.geolocation)
      throw new Error("이 브라우저에서는 위치 찾기를 지원하지 않아요.");
    if (!window.isSecureContext)
      throw new Error(
        "내 위치는 HTTPS 연결에서 사용할 수 있어요. 지역 검색을 이용해 주세요.",
      );
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.disposed) {
            resolve();
            return;
          }
          const center = fromLonLat([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          this.location.clear();
          this.location.addFeature(new Feature(new Point(center)));
          this.map
            .getView()
            .animate({ center, zoom: 14, duration: this.duration });
          resolve();
        },
        (error) => {
          reject(
            new Error(
              error.code === 1
                ? "위치 권한이 꺼져 있어요. 브라우저 설정에서 허용해 주세요."
                : error.code === 3
                  ? "위치 확인이 지연되고 있어요. 다시 시도해 주세요."
                  : "현재 위치를 확인하지 못했어요. 지역 검색을 이용해 주세요.",
            ),
          );
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    });
  }

  dispose() {
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.map.setTarget(undefined);
    this.map.dispose();
    this.tiles.dispose();
    this.markerStyles.clear();
  }
}
