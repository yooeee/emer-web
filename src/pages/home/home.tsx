import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import apiCall from '../../utils/api';
import '../../assets/home.css';

const Home = () => {
  const [siCd, setSiCd] = useState('');
  const [sigunguList, setSigunguList] = useState([]);

  const handleSearch = async (siCd: string) => {
    setSiCd(siCd);
    try {
      const result = await apiCall("http://localhost:4041/api/sigungu", {siCd : siCd});
      setSigunguList(result);
      console.log(result);
    } catch (error) {
      console.error('시군구 데이터 조회 실패:', error);
    }
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

