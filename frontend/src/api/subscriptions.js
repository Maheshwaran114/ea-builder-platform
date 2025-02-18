// frontend/src/api/subscriptions.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const activateFreeSubscription = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/api/subscriptions/free`, { userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionStatus = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/subscriptions/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const upgradeSubscription = async (userId) => {
  try {
    const response = await axios.post(`${API_URL}/api/subscriptions/upgrade`, { userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
