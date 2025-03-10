import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import '../../assets/home.css';

const Home = () => {
  const [siCd, setSiCd] = useState('');
  const [sigunguList, setSigunguList] = useState([]);

  const handleSearch = async (siCd: string, sigunguCd: string, name: string) => {
    
  };

  return (
    <div className="home-container">
      <SideBar onSearch={handleSearch}  sigunguList={sigunguList} />
      <div className="map-container">
        <MapComponent  />
      </div>
    </div>
  );
};

export default Home;

