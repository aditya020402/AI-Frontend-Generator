import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useComponentStore } from '../stores/componentStore';
import { createRoot } from 'react-dom/client';

export default function LivePreview() {
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const { currentComponent, framework } = useComponentStore();

  // ✅ SAFE CODE CHECK - Prevents "includes" error
  const code = currentComponent?.current_code || '';
  const isReact = framework === 'react' || (code && code.includes('React') || code.includes('jsx') || code.includes('className'));
  const isEmpty = !code || code.trim() === '' || code.includes('// Generating...');

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    // Clear previous content
    preview.innerHTML = '';

    if (isEmpty) {
      // Show loading/empty state
      preview.innerHTML = `
        <div class="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Preview Available</h3>
          <p class="text-gray-600 mb-8 max-w-sm">${currentComponent ? 'Edit code on the left to see live preview' : 'Select or create a component'}</p>
          ${!currentComponent && '<button class="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">Create New Component</button>'}
        </div>
      `;
      return;
    }

    if (isReact) {
      // ✅ REACT PREVIEW - iframe sandbox
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { height: 100%; overflow: hidden; }
                body { background: #f8fafc; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                #root { min-height: 400px; max-width: 600px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                ${code}
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } else {
      // ✅ HTML/CSS/JS PREVIEW - Direct DOM
      preview.innerHTML = code;
      
      // Extract and run inline scripts safely
      const scripts = preview.getElementsByTagName('script');
      for (let script of scripts) {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        script.parentNode.replaceChild(newScript, script);
      }
    }
  }, [code, isReact, isEmpty, currentComponent]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <Typography variant="subtitle1" className="font-bold text-gray-900">
                Live Preview
              </Typography>
              <Typography variant="caption" className="text-gray-500 block">
                {framework === 'react' ? 'React + Tailwind' : 'HTML/CSS/JS'}
              </Typography>
            </div>
          </div>
          
          <Chip 
            label={isReact ? 'React' : 'HTML'} 
            size="small" 
            className="bg-blue-100 text-blue-800 font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        {isEmpty ? (
          <div ref={previewRef} className="h-full" />
        ) : isReact ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts"
            title="Live Preview"
          />
        ) : (
          <div 
            ref={previewRef}
            className="w-full h-full p-6 overflow-auto bg-white/50 backdrop-blur-sm"
            style={{ minHeight: '400px' }}
          />
        )}
        
        {/* Loading Overlay */}
        {!code && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center p-8">
              <CircularProgress size={48} className="text-blue-600 mb-4" />
              <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                Loading Preview...
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Generating live preview
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Auto-updates with code changes</span>
          <div className="flex items-center gap-2">
            {currentComponent?.id && (
              <Chip label={`ID: ${currentComponent.id.slice(-8)}`} size="small" className="bg-gray-100" />
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}
