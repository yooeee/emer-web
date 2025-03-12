import React from 'react';
import '../assets/MarkerPopup.css';

interface MarkerPopupProps {
  hospital: {
    dutyName: string;
    dutyAddr: string;
    dutyTel1: string;
    dutyEmclsName: string;
  };
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({ hospital }) => {
  return (
    <div className="marker-popup">
      <h3 className="hospital-name">{hospital.dutyName}</h3>
      <div className="hospital-info">
        <p className="hospital-type">{hospital.dutyEmclsName}</p>
        <p className="hospital-tel">{hospital.dutyTel1}</p>
      </div>
    </div>
  );
};

export default MarkerPopup; 