import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const createPaymentOrder = async (userId, amount) => {
  try {
    const response = await axios.post(`${API_URL}/api/payments/create`, { userId, amount });
    return response.data;
  } catch (error) {
    throw error;
  }
};
