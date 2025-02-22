// frontend/src/components/CodeEditor.js
import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange }) => {
  return (
    <div style={{ height: '500px', border: '1px solid #ddd', marginTop: '20px' }}>
      <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            theme="vs-dark"
            onChange={onChange}
        />

    </div>
  );
};

export default CodeEditor;
