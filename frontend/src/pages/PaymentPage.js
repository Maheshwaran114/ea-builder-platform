import React, { useState } from 'react';
import { createPaymentOrder } from '../api/payment';

const PaymentPage = () => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      const data = await createPaymentOrder(parseInt(userId), parseFloat(amount));
      setOrderDetails(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Payment order creation failed.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Payment Page</h2>
      <div>
        <label>User ID: </label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <div>
        <label>Amount: </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={handlePayment}>Create Payment Order</button>
      {orderDetails && (
        <div>
          <h4>Order Details</h4>
          <p>Order ID: {orderDetails.order_id}</p>
          <p>
            Payment URL: <a href={orderDetails.paymentUrl} target="_blank" rel="noreferrer">Pay Now</a>
          </p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PaymentPage;
