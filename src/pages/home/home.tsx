import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import '../../assets/home.css';

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    region: '',
    name: ''
  });

  const handleSearch = (region: string, name: string) => {
    setSearchParams({ region, name });
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

