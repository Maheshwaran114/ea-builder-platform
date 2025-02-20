// frontend/src/pages/EABuilder.js
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeEditor from '../components/CodeEditor';
import Sidebar from '../components/Sidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import DropArea from '../components/DropArea';
import OnboardingTour from '../components/OnboardingTour';
import RiskManagementSettings from '../components/RiskManagementSettings';

const EABuilder = () => {
  const [blocks, setBlocks] = useState([]);
  const [code, setCode] = useState('// EA generated code will appear here.');
  const [riskSettings, setRiskSettings] = useState({ stopLoss: 50, trailingStop: 20 });

  const handleDrop = (item) => {
    setBlocks([...blocks, item.type]);
    setCode((prev) => prev + `\n// Added block: ${item.type}`);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

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
            <CodeEditor code={code} onChange={handleCodeChange} />
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default EABuilder;
