import React from 'react';
import { useDrop } from 'react-dnd';

function DropArea({ onDrop }) {
  const [{ isOver }, drop] = useDrop({
    accept: ['ENTRY', 'EXIT', 'INDICATOR'],
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className="drop-area" style={{ height: '400px', border: isOver ? '2px dashed green' : '2px dashed #ccc', padding: '10px' }}>
      {isOver ? "Release to drop" : "Drag blocks here"}
    </div>
  );
}

export default DropArea;
