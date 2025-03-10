import React, { useState, useEffect } from 'react';
import '../assets/SideBar.css';

// 광역시도 목록
const regions = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도'
];

interface SideBarProps {
  onSearch: (region: string, name: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ onSearch }) => {
  const [selectedSido, setSelectedSido] = useState<string>('');
  const [selectedSigungu, setSelectedSigungu] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // 화면 크기 변경 감지
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 초기 체크
    checkIfMobile();

    // 화면 크기 변경 시 체크
    window.addEventListener('resize', checkIfMobile);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // 모바일이 아닐 때는 항상 열려있도록
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = () => {
    onSearch(selectedSido, hospitalName);
    // 모바일에서 검색 후 사이드바 닫기
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`} 
        onClick={toggleSidebar}
        aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
      >
        <div className="sidebar-toggle-icon"></div>
      </button>
      
      <div className={`overlay ${isOpen && isMobile ? 'show' : ''}`} onClick={handleOverlayClick}></div>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">응급실 검색</h2>
        
        <div className="form-group">
          <label htmlFor="sido" className="form-label">
            광역시도
          </label>
          <select
            id="sido"
            className="form-select"
            value={selectedSido}
            onChange={(e) => setSelectedSido(e.target.value)}
          >
            <option value="">선택하세요</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className='form-group'>
            <label htmlFor='sigungu' className='form-label'>
                시군구
            </label>
            <select
                id='sigungu'
                className='form-select'
                value={selectedSigungu}
                onChange={(e) => setSelectedSigungu(e.target.value)}
            >
                <option value=''>선택하세요</option>
            </select>
        </div>

        <div className="form-group">
          <label htmlFor="hospitalName" className="form-label">
            병원 이름
          </label>
          <input
            id="hospitalName"
            type="text"
            className="form-input"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="병원 이름을 입력하세요"
          />
        </div>

        <button
          className="search-button"
          onClick={handleSearch}
        >
          검색
        </button>
      </div>
    </>
  );
};

export default SideBar; 