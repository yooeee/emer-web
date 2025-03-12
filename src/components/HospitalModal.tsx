import React from 'react';
import '../assets/HospitalModal.css';

interface HospitalModalProps {
  hospital: any;
  onClose: () => void;
}

const HospitalModal: React.FC<HospitalModalProps> = ({ hospital, onClose }) => {
  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="hospital-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2 className="modal-title">{hospital.dutyName}</h2>
          <span className="hospital-type-badge">{hospital.dutyEmclsName}</span>
        </div>
        <div className="modal-body">
          <div className="info-row">
            <div className="info-label">주소</div>
            <div className="info-value">{hospital.dutyAddr}</div>
          </div>
          <div className="info-row">
            <div className="info-label">전화번호</div>
            <div className="info-value">{hospital.dutyTel1}</div>
          </div>
          {hospital.dutyTel3 && (
            <div className="info-row">
              <div className="info-label">응급실</div>
              <div className="info-value">{hospital.dutyTel3}</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <a 
            href={`tel:${hospital.dutyTel1}`} 
            className="call-button"
          >
            전화 걸기
          </a>
        </div>
      </div>
    </div>
  );
};

export default HospitalModal; 