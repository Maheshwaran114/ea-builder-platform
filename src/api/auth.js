import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, { username, password });
    return response.data; // Contains the JWT token
  } catch (error) {
    throw error;
  }
};

export const signupUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/signup`, { username, password });
    return response.data; // Contains the new user details
  } catch (error) {
    throw error;
  }
};
