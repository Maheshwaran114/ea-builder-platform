// frontend/src/pages/SubscriptionStatus.js
import React, { useEffect, useState } from 'react';
import { getSubscriptionStatus } from '../api/subscriptions';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  
  // For demonstration, we're hardcoding the userId. In a real application, use the authenticated user's ID.
  const userId = 3;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSubscriptionStatus(userId);
        setStatus(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch subscription status.');
      }
    };
    fetchStatus();
  }, [userId]);

  return (
    <div>
      <h2>Subscription Status</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status ? (
        <div>
          <p>Subscription Type: {status.subscription_type}</p>
          <p>Subscription Start: {new Date(status.subscription_start).toLocaleString()}</p>
          <p>EA Model Count: {status.ea_model_count}</p>
        </div>
      ) : (
        <p>No subscription found for this user.</p>
      )}
    </div>
  );
};

export default SubscriptionStatus;
