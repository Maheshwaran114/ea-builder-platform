import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnhancedAdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/admin/analytics');
        console.log('Admin analytics data:', response.data);
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
        setError('Failed to load analytics data.');
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Enhanced Admin Analytics Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {analytics ? (
        <div>
          <p>Total EA Models: {analytics.totalModels}</p>
          <p>
            Average Profit:{" "}
            {analytics.avgProfit !== null && analytics.avgProfit !== undefined
              ? Number(analytics.avgProfit).toFixed(2)
              : "N/A"}
          </p>
          <p>
            Average Drawdown:{" "}
            {analytics.avgDrawdown !== null && analytics.avgDrawdown !== undefined
              ? Number(analytics.avgDrawdown).toFixed(2)
              : "N/A"}
          </p>
          <p>
            Average Win Ratio:{" "}
            {analytics.avgWinRatio !== null && analytics.avgWinRatio !== undefined
              ? Number(analytics.avgWinRatio).toFixed(2)
              : "N/A"}
          </p>
          <p>Total Purchases: {analytics.totalPurchases}</p>
        </div>
      ) : (
        <p>Loading analytics data...</p>
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;
