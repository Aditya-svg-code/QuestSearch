import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const searchQuestions = async (query, page = 1) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: {
            query,
            page,
            limit: 10
        }
    });
    return response.data;
};