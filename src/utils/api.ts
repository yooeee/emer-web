
import axios from 'axios';

const apiCall = async (url: string, params: object) => {
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
};

export default apiCall;
