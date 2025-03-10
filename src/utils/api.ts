
import axios from 'axios';

const apiCall = async (url: string, params: object) => {
    try {
        const response = await axios.get(url, { params });
        if(response.status === 200) {
            return response.data.result;
        } else {
            throw new Error('서버 오류입니다. 담당자에게 문의하세요.');
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        throw error;
    }
};

export default apiCall;
