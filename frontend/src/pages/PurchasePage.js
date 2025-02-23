import React, { useState } from 'react';
import { createPaymentOrder } from '../api/payment';

const PurchasePage = () => {
  const [eaModelId, setEaModelId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    try {
      const data = await createPaymentOrder(parseInt(buyerId), 100); // Using a dummy amount (100) for purchase
      setOrderDetails(data.order);
      setError('');
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Purchase failed.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Purchase EA Model</h2>
      <div>
        <label>EA Model ID: </label>
        <input
          type="number"
          value={eaModelId}
          onChange={(e) => setEaModelId(e.target.value)}
        />
      </div>
      <div>
        <label>Buyer ID: </label>
        <input
          type="number"
          value={buyerId}
          onChange={(e) => setBuyerId(e.target.value)}
        />
      </div>
      <button onClick={handlePurchase}>Purchase</button>
      {orderDetails && (
        <div>
          <h4>Order Details</h4>
          <p>Order ID: {orderDetails.order_id}</p>
          <p>Amount: {orderDetails.amount}</p>
          <p>Status: {orderDetails.status}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PurchasePage;
