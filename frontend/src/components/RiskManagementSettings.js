// frontend/src/components/RiskManagementSettings.js
import React from 'react';

const RiskManagementSettings = ({ settings, onChange }) => {
  return (
    <div style={{ marginTop: '20px', border: '2px solid red', padding: '10px' }}>
      <h4>Risk Management Settings</h4>
      <div>
        <label>Stop Loss: </label>
        <input
          type="number"
          value={settings.stopLoss || ''}
          onChange={(e) => onChange({ ...settings, stopLoss: parseFloat(e.target.value) })}
        />
      </div>
      <div>
        <label>Trailing Stop: </label>
        <input
          type="number"
          value={settings.trailingStop || ''}
          onChange={(e) => onChange({ ...settings, trailingStop: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
};

export default RiskManagementSettings;
