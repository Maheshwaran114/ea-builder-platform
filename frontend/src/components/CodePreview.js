import React from 'react';

function CodePreview({ code }) {
  return (
    <div className="code-preview" style={{ background: '#f4f4f4', padding: '10px', border: '1px solid #ddd', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
      <h4>Live Code Preview</h4>
      <code>{code}</code>
    </div>
  );
}

export default CodePreview;
