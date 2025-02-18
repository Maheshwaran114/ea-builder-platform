// frontend/src/pages/PremiumUpgrade.js
import React, { useState, useEffect } from 'react';
import { getSubscriptionStatus, upgradeSubscription } from '../api/subscriptions';

const PremiumUpgrade = () => {
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const userId = 3; // Replace with the authenticated user's ID

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSubscriptionStatus(userId);
        setSubscription(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch subscription status.');
      }
    };
    fetchStatus();
  }, [userId]);

  const handleUpgrade = async () => {
    try {
      const data = await upgradeSubscription(userId);
      setSubscription(data.subscription);
      setMessage('Successfully upgraded to premium.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Premium upgrade failed.');
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Premium Upgrade</h2>
      {subscription && (
        <div>
          <p>Current Subscription: {subscription.subscription_type}</p>
          <p>Subscription Start: {new Date(subscription.subscription_start).toLocaleString()}</p>
          <p>EA Model Count: {subscription.ea_model_count}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={handleUpgrade}>Upgrade to Premium</button>
    </div>
  );
};

export default PremiumUpgrade;
