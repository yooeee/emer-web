import Dialog from "./Dialog";
import Icon from "./Icon";

export default function ServiceGuide({ onClose }: { onClose: () => void }) {
  return (
    <Dialog labelId="guide-title" onClose={onClose} className="guide-dialog">
      <span className="eyebrow">ABOUT EMER</span>
      <h2 id="guide-title">
        필요한 정보를,
        <br />더 가까이.
      </h2>
      <p className="dialog-description">
        EMER는 지역별 응급의료기관의 위치와 연락처를 한곳에서 찾을 수 있는 지도
        서비스입니다.
      </p>
      <ol className="guide-steps">
        <li>
          <span>01</span>
          <div>
            <h3>찾고 싶은 지역 선택</h3>
            <p>
              시·도와 시·군·구를 선택해 주세요. 병원 이름으로도 검색할 수
              있어요.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>목록과 지도에서 확인</h3>
            <p>검색된 의료기관을 선택하면 지도에서 위치를 확인할 수 있어요.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>방문 전 전화로 확인</h3>
            <p>
              상세정보에서 주소와 연락처를 확인하고 병원에 바로 전화할 수
              있어요.
            </p>
          </div>
        </li>
      </ol>
      <p className="notice">
        <Icon name="info" />
        병상과 진료 가능 여부는 실시간으로 표시되지 않습니다. 의료기관에 직접
        확인해 주세요.
      </p>
      <a href="tel:119" className="emergency-guide">
        <Icon name="phone" />
        <span>
          위급한 상황에는 <strong>119</strong>
        </span>
        <Icon name="arrow" />
      </a>
    </Dialog>
  );
}
