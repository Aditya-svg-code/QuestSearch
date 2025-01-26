import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Adjust if needed

export const searchQuestions = async (query, page = 1) => {
    const response = await axios.get(`${API_URL}/search`, {
        params: {
            query,
            page, // Include the page parameter for pagination
            limit: 10 // Set the limit for questions per page
        }
    });
    return response.data; // Return the entire response data
};