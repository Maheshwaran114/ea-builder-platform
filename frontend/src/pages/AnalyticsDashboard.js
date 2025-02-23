import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data.');
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Analytics Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {analytics ? (
        <div>
          <p>Total EA Models: {analytics.totalModels}</p>
          <p>
            Average Profit:{" "}
            {analytics.avgProfit !== null
              ? Number(analytics.avgProfit).toFixed(2)
              : "N/A"}
          </p>
          <p>
            Average Drawdown:{" "}
            {analytics.avgDrawdown !== null
              ? Number(analytics.avgDrawdown).toFixed(2)
              : "N/A"}
          </p>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
