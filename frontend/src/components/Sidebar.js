import React from 'react';
import { useDrag } from 'react-dnd';

const BlockItem = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, border: '1px solid #aaa', padding: '5px', margin: '5px' }}>
      {label}
    </div>
  );
};

function Sidebar() {
  return (
    <div className="sidebar">
      <h3>Toolbox</h3>
      <BlockItem type="ENTRY" label="Entry Condition" />
      <BlockItem type="EXIT" label="Exit Condition" />
      <BlockItem type="INDICATOR" label="Indicator" />
    </div>
  );
}

export default Sidebar;
