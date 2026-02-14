import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useComponentStore } from '../stores/componentStore';

export default function Editor() {
  const { code, framework, updateCode } = useComponentStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Code Editor</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
            {framework.toUpperCase()}
          </span>
        </div>
      </div>
      <MonacoEditor
        height="100%"
        language={framework === 'react' ? 'javascript' : 'html'}
        theme="vs-dark"
        value={code || ''}
        onChange={updateCode}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontFamily: 'JetBrains Mono, Consolas, monospace'
        }}
        className="!border-r-0 !rounded-t-none shadow-none"
      />
    </div>
  );
}
