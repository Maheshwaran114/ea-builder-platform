// frontend/src/api/eacode.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const generateEACode = async (configuration) => {
  try {
    const response = await axios.post(`${API_URL}/api/eacode`, { configuration });
    return response.data;
  } catch (error) {
    throw error;
  }
};
