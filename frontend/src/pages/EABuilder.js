// frontend/src/pages/EABuilder.js
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CodeEditor from '../components/CodeEditor';
import Sidebar from '../components/Sidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import DropArea from '../components/DropArea';
import OnboardingTour from '../components/OnboardingTour';

const EABuilder = () => {
  const [blocks, setBlocks] = useState([]);
  const [code, setCode] = useState('// EA generated code will appear here.');

  const handleDrop = (item) => {
    setBlocks([...blocks, item.type]);
    // Simulate code generation update when a block is dropped.
    setCode(prevCode => prevCode + `\n// Added block: ${item.type}`);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  return (
    <div className="ea-builder">
      <OnboardingTour />
      {/* Wrap the part that uses drag-and-drop in a DndProvider */}
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '20px' }}>
            <h2>EA Builder Canvas</h2>
            <DropArea onDrop={handleDrop} />
            <div>
              <h4>Dropped Blocks:</h4>
              <ul>
                {blocks.map((block, index) => (
                  <li key={index}>{block}</li>
                ))}
              </ul>
            </div>
            {/* Code Editor Integration */}
            <h3>EA Code Editor</h3>
            <CodeEditor code={code} onChange={handleCodeChange} />
          </main>
          <PropertiesPanel />
        </div>
      </DndProvider>
    </div>
  );
};

export default EABuilder;
