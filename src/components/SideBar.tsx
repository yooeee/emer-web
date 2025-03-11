import React, { useState, useEffect } from 'react';
import '../assets/SideBar.css';
import '../assets/common.css';
import apiCall from '../utils/api';

// 광역시도 목록
const regions = [
  { code: '11', name: '서울특별시' },
  { code: '26', name: '부산광역시' },
  { code: '27', name: '대구광역시' },
  { code: '28', name: '인천광역시' },
  { code: '29', name: '광주광역시' },
  { code: '30', name: '대전광역시' },
  { code: '31', name: '울산광역시' },
  { code: '36', name: '세종특별자치시' },
  { code: '41', name: '경기도' },
  { code: '51', name: '강원도' },
  { code: '43', name: '충청북도' },
  { code: '44', name: '충청남도' },
  { code: '52', name: '전라북도' },
  { code: '46', name: '전라남도' },
  { code: '47', name: '경상북도' },
  { code: '48', name: '경상남도' },
  { code: '50', name: '제주특별자치도' }
];

interface SideBarProps {
  onSearch: (siCd: string, sigunguCd: string, type: string, name: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ onSearch }) => {
const [siNm, setSiNm] = useState<string>('');
  const [siCd, setSiCd] = useState<string>('');
  const [sigunguList, setSigunguList] = useState<any>([]);
  const [sigunguNm, setSigunguNm] = useState<string>('');
  const [type, setType] = useState<string>('');
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

  const handleSigunguChange = async (siNm: string, siCd: string) => {
    setSiNm(siNm);
    setSiCd(siCd);
    try {
      const result = await apiCall("http://localhost:4041/api/sigungu", {siCd : siCd});
      setSigunguList(result);
    } catch (error) {
      console.error('시군구 데이터 조회 실패:', error);
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
            <span className="text_red">*</span>
          </label>
          <select
            id="sido"
            className="form-select"
            value={siCd}
            onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                handleSigunguChange(selectedOption.getAttribute('data-name') || '', e.target.value);
            }}
          >
            <option value='' disabled>선택하세요</option>
            {regions.map((region) => (
              <option key={region.code} value={region.code} data-name={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div className='form-group'>
            <label htmlFor='sigungu' className='form-label'>
                시군구
                <span className="text_red">*</span>
            </label>
            <select
                id='sigungu'
                className='form-select'
                value={sigunguNm}
                onChange={(e) => setSigunguNm(e.target.value)}
            >
                <option value='' disabled>선택하세요</option>
                {sigunguList.map((sigungu: any) => (
                    <option key={sigungu.admCode} value={sigungu.lowestAdmCodeNm}>
                        {sigungu.lowestAdmCodeNm}
                    </option>
                ))}
            </select>
        </div>

        <div className='form-group'>
            <label htmlFor='type' className='form-label'>
                유형
                <span className="text_red">*</span>
            </label>
            <select
                id='type'
                className='form-select'
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value='' disabled>선택하세요</option>
                <option value="getEgytListInfoInqire" selected>응급의료기관 목록정보 조회</option>
                <option value="getStrmListInfoInqire">외상센터 목록정보 조회</option>
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
          onClick={() => onSearch(siNm, sigunguNm, type, hospitalName)}
        >
          검색
        </button>
      </div>
    </>
  );
};

export default SideBar; 