// frontend/src/pages/EABuilder.js
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeEditor from '../components/CodeEditor';
import Sidebar from '../components/Sidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import DropArea from '../components/DropArea';
import OnboardingTour from '../components/OnboardingTour';
import RiskManagementSettings from '../components/RiskManagementSettings';
import { generateEACode } from '../api/eacode';

const EABuilder = () => {
  const [blocks, setBlocks] = useState([]);
  const [code, setCode] = useState('// EA generated code will appear here.');
  const [riskSettings, setRiskSettings] = useState({ stopLoss: 50, trailingStop: 20 });
  const [indicators, setIndicators] = useState([]); // Array of indicator objects
  const [conditions, setConditions] = useState([]); // Array of condition strings

  const handleDrop = (item) => {
    // Assume item.type holds indicator name; default parameter set to 10
    setIndicators([...indicators, { name: item.type, parameter: 10 }]);
    setBlocks([...blocks, item.type]);
  };

// Automatically update EA code whenever indicators, riskSettings, or conditions change.
useEffect(() => {
  const configuration = {
    indicators,
    riskSettings,
    conditions,
  };
  console.log('Updating EA code with configuration:', configuration);
  const updateCode = async () => {
    try {
      const data = await generateEACode(configuration);
      console.log('Generated code:', data.code);
      setCode(data.code);
    } catch (error) {
      console.error('Error generating EA code:', error);
    }
  };
  updateCode();
}, [indicators, riskSettings, conditions]);


  return (
    <div className="ea-builder" style={{ padding: '20px' }}>
      <OnboardingTour />
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Left Panel: Indicator List */}
          <div style={{ flexBasis: '20%', border: '1px solid #ccc', minHeight: '400px', padding: '10px' }}>
            <Sidebar />
          </div>
          {/* Center Panel: Visual EA Builder */}
          <div style={{ flexBasis: '55%', border: '1px solid #ccc', margin: '0 10px', minHeight: '400px', padding: '10px' }}>
            <h2>EA Builder</h2>
            <div style={{ marginBottom: '10px' }}>
              <DropArea onDrop={handleDrop} />
            </div>
            <div>
              <h4>Dropped Blocks:</h4>
              <ul>
                {blocks.map((block, index) => (
                  <li key={index}>{block}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Right Panel: Configuration & Risk Management */}
          <div style={{ flexBasis: '20%', border: '1px solid #ccc', minHeight: '400px', padding: '10px' }}>
            <PropertiesPanel />
            <RiskManagementSettings settings={riskSettings} onChange={setRiskSettings} />
          </div>
          {/* Full-Width Row: Code Editor */}
          <div style={{ flexBasis: '100%', marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>EA Code Editor</h3>
            <CodeEditor code={code} onChange={(newCode) => setCode(newCode)} />
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default EABuilder;
