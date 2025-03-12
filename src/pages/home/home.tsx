import 'ol/ol.css';
import MapComponent from '../../components/Map';
import SideBar from '../../components/SideBar';
import { useState } from 'react';
import apiCall from '../../utils/api';
import '../../assets/home.css';
import MapManager from '../../utils/MapManager';

const Home = () => {

    const [searchResult, setSearchResult] = useState([]);


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
            setSearchResult(result);
        }
            
    }

  return (
    <div className="home-container">
      <SideBar onSearch={onSearch} />
      <div className="map-container">
        <MapComponent  searchResult={searchResult}/>
      </div>
    </div>
  );
};

export default Home;

