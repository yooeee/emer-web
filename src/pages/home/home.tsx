import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import '../../assets/home.css';

const Home = () => {



  return (
    <div className="home-container">
      <SideBar  />
      <div className="map-container">
        <MapComponent  />
      </div>
    </div>
  );
};

export default Home;

