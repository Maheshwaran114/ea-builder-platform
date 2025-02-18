// src/api/backtest.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const runBacktest = async (configuration) => {
  try {
    const response = await axios.post(`${API_URL}/api/backtest`, { configuration });
    return response.data;
  } catch (error) {
    throw error;
  }
};
