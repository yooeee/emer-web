import { useState } from "react";
import { Hospital, phoneHref } from "../types/hospital";
import Dialog from "./Dialog";
import Icon from "./Icon";

export default function HospitalDetails({
  hospital,
  onClose,
}: {
  hospital: Hospital;
  onClose: () => void;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  const telephone =
    phoneHref(hospital.emergencyPhone) || phoneHref(hospital.phone);
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(hospital.address);
      setCopyMessage("주소를 복사했어요.");
    } catch {
      setCopyMessage(
        "자동 복사가 지원되지 않아요. 주소를 길게 누르거나 선택해서 복사해 주세요.",
      );
    }
  };
  return (
    <Dialog labelId="hospital-title" onClose={onClose}>
      <div className="detail-symbol">
        <Icon name="hospital" width={28} height={28} />
      </div>
      <span className="eyebrow">의료기관 상세정보</span>
      <h2 id="hospital-title">{hospital.name}</h2>
      <span className="category-badge">{hospital.category}</span>
      <dl className="detail-list">
        <div>
          <dt>
            <Icon name="pin" />
            주소
          </dt>
          <dd>
            {hospital.address || "등록된 주소가 없어요."}
            {hospital.address && (
              <button
                type="button"
                className="text-button copy-button"
                onClick={copyAddress}
              >
                <Icon name="copy" width={15} height={15} />
                주소 복사
              </button>
            )}
            {copyMessage && (
              <span className="copy-message" role="status">
                {copyMessage}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>
            <Icon name="phone" />
            대표전화
          </dt>
          <dd>
            {phoneHref(hospital.phone) ? (
              <a href={phoneHref(hospital.phone)}>{hospital.phone}</a>
            ) : (
              "등록된 번호가 없어요."
            )}
          </dd>
        </div>
        {phoneHref(hospital.emergencyPhone) && (
          <div>
            <dt>
              <Icon name="pulse" />
              응급실 전화
            </dt>
            <dd>
              <a href={phoneHref(hospital.emergencyPhone)}>
                {hospital.emergencyPhone}
              </a>
            </dd>
          </div>
        )}
      </dl>
      <p className="notice">
        <Icon name="info" />
        방문 전 전화로 진료 및 수용 가능 여부를 확인해 주세요.
      </p>
      <div className="detail-actions">
        {telephone ? (
          <a href={telephone} className="primary-button">
            <Icon name="phone" />
            {phoneHref(hospital.emergencyPhone)
              ? "응급실에 전화하기"
              : "병원에 전화하기"}
          </a>
        ) : (
          <span className="unavailable-contact">
            전화번호 정보가 제공되지 않았어요.
          </span>
        )}
        {hospital.address && (
          <a
            className="secondary-button"
            href={`https://map.naver.com/p/search/${encodeURIComponent(`${hospital.name} ${hospital.address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            네이버 지도에서 보기
            <Icon name="external" width={16} height={16} />
          </a>
        )}
      </div>
    </Dialog>
  );
}
