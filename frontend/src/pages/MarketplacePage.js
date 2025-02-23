import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MarketplacePage = () => {
  const [models, setModels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/marketplace');
        setModels(response.data);
      } catch (err) {
        console.error('Error fetching marketplace models:', err);
        setError('Failed to load marketplace models.');
      }
    };
    fetchModels();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Community Marketplace</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {models.length > 0 ? (
        <div>
          {models.map((model) => (
            <div key={model.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{model.name}</h3>
              <p>Price: ${model.price}</p>
              <p>Submitted by User ID: {model.user_id}</p>
              <p>Approval Status: {model.approval_status}</p>
              <a href={`/purchase?eaModelId=${model.id}`}>Purchase Now</a>
              <div style={{ marginTop: '10px' }}>
                <em>Discussion board coming soon...</em>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No approved EA models available at the moment.</p>
      )}
    </div>
  );
};

export default MarketplacePage;
