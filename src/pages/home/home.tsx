import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useEffect, useState } from 'react';
import apiCall from '../../utils/api';
import '../../assets/home.css';
import MapManager from '../../utils/MapManager';

const Home = () => {

    const [searchResult, setSearchResult] = useState([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
  
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

      const updateIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      const handleOverlayClick = () => {
        if (isMobile) {
          setIsOpen(false);
        }
      };



    const onSearch = async (siNm: string, sigunguNm: string, type: string, name: string) => {
        if(siNm === '' || sigunguNm === '' || type === '') {
            alert('모든 항목을 입력해주세요.');
            return;
        } else{  
            const result = await apiCall("http://localhost:3030/api/search", {
              Q0: siNm,
              Q1: sigunguNm,
              pageNo: 1,
              numOfRows: 999,
              QN: name,
              type: type,
            });    
            if(result != null){
              if(isMobile && isOpen){
                toggleSidebar();
              }
              setSearchResult(result);
            } else{
              alert('검색 결과가 없습니다.');
            }
            
        }
            
    }

  return (
    <div className="home-container">
      <SideBar 
        onSearch={onSearch} 
        isOpen={isOpen} 
        isMobile={isMobile}
        updateIsMobile={updateIsMobile} 
        toggleSidebar={toggleSidebar}
        handleOverlayClick={handleOverlayClick}
       />
      <div className="map-container">
        <MapComponent  searchResult={searchResult}/>
      </div>
    </div>
  );
};

export default Home;

