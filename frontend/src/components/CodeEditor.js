// frontend/src/components/CodeEditor.js
import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange }) => {
  return (
    <div style={{ height: '500px', border: '1px solid #ddd', marginTop: '20px' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript" // You can change this to a custom language if available
        defaultValue={code}
        theme="vs-dark"              // or "light" theme as per your design
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;
