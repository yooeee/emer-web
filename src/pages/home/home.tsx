import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import '../../assets/home.css';

const Home = () => {

    const onSearch = (siNm: string, sigunguNm: string, type: string, name: string) => {
        if(siNm === '' || sigunguNm === '' || type === '') {
            alert('모든 항목을 입력해주세요.');
            console.log(siNm + sigunguNm + type + name);
            return;
        } else{

            alert(siNm + sigunguNm + type + name);      
        }
            
    }

  return (
    <div className="home-container">
      <SideBar onSearch={onSearch} />
      <div className="map-container">
        <MapComponent  />
      </div>
    </div>
  );
};

export default Home;

