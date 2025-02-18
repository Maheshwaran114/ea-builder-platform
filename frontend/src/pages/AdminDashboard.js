// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [topModels, setTopModels] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // For demonstration, assume that a key "isAdmin" in localStorage is set to "true" for admin users.
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      // If not admin, redirect to login or another appropriate page
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTopModels = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/admin/top-eamodels');
        setTopModels(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch top EA models.');
      }
    };
    fetchTopModels();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard: Top 20 EA Models</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {topModels.length > 0 ? (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {topModels.map((model) => (
              <tr key={model.id}>
                <td>{model.id}</td>
                <td>{model.user_id}</td>
                <td>{model.name}</td>
                <td>{new Date(model.created_at).toLocaleString()}</td>
                <td>{new Date(model.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No top EA models found.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
