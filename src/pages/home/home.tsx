import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import apiCall from '../../utils/api';
import '../../assets/home.css';

const Home = () => {
  const [siCd, setSiCd] = useState('');

  const handleSearch = (siCd: string) => {
    setSiCd(siCd);
    apiCall("http://localhost:4041/api/sigungu", {siCd : siCd})
    .then(response => {
      console.log('API 응답:', response);
      // 여기서 응답 데이터 처리
    })
    .catch(error => {
      console.error('API 호출 오류:', error);
    });
  };

  return (
    <div className="home-container">
      <SideBar onSearch={handleSearch} />
      <div className="map-container">
        <MapComponent />
      </div>
    </div>
  );
};

export default Home;

