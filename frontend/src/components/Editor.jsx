import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useComponentStore } from '../stores/componentStore';

export default function Editor() {
  const { currentComponent, framework, updateCode } = useComponentStore();
  const [editorCode, setEditorCode] = useState('');

  // ✅ CRITICAL: Sync editor with store changes
  useEffect(() => {
    const code = currentComponent?.current_code || '';
    if (code !== editorCode) {
      setEditorCode(code);
    }
  }, [currentComponent?.current_code]);

  // ✅ DEBOUNCE - Update store + backend after typing stops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editorCode !== currentComponent?.current_code) {
        updateCode(editorCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editorCode]);

  const handleEditorChange = (value) => {
    setEditorCode(value || '');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border-r border-slate-700/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-sm font-bold text-slate-200 tracking-wide">CODE EDITOR</span>
            <Chip 
              label={framework.toUpperCase()} 
              size="small" 
              className="!bg-slate-700 !text-slate-200 !font-mono !text-xs border-slate-600 shadow-md" 
            />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {currentComponent?.id?.slice(-8) || 'WELCOME'}
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height="100%"
        language={framework === 'react' ? 'javascript' : 'html'}
        theme="vs-dark"
        value={editorCode}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: true },
          fontSize: 15,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          renderLineHighlight: 'gutter',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          codeLens: true
        }}
        className="!m-0 !border-none !shadow-none"
      />
    </div>
  );
}
