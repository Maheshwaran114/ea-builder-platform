// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const signupUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/signup`, { username, password });
    return response.data; // Returns created user object
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, { username, password });
    return response.data; // Returns { token: '...' }
  } catch (error) {
    throw error;
  }
};
