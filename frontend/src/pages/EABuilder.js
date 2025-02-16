import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from '../components/Sidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import DropArea from '../components/DropArea';
import CodePreview from '../components/CodePreview';
import OnboardingTour from '../components/OnboardingTour';

function EABuilder() {
  const [blocks, setBlocks] = useState([]);

  const handleDrop = (item) => {
    setBlocks([...blocks, item.type]);
  };

  const generatedCode = `// Generated MQL Code:\n${blocks
    .map((b, i) => `// Block ${i + 1}: ${b}`)
    .join('\n')}`;

  return (
    <div className="ea-builder">
      <OnboardingTour />
      <div className="layout">
        <DndProvider backend={HTML5Backend}>
          <Sidebar />
          <main className="main-canvas">
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
            <CodePreview code={generatedCode} />
          </main>
        </DndProvider>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default EABuilder;
