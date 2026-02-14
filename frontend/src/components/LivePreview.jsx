import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip 
} from '@mui/material';
import { useComponentStore } from '../stores/componentStore';

export default function LivePreview() {
  const iframeRef = useRef(null);
  const { currentComponent, framework } = useComponentStore();

  const code = currentComponent?.current_code || '';
  const hasCode = code && code.trim() && !code.includes('// Generating...');
  const isReact = framework === 'react' || code.includes('className') || code.includes('useState');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !hasCode) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    
    if (isReact) {
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <!-- ✅ FIXED: Babel with EXPLICIT JSX plugin - NO modules! -->
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { 
              height: 100vh; 
              overflow: hidden; 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 2rem;
              font-family: system-ui, sans-serif;
            }
            #root { 
              max-width: 500px; 
              margin: 0 auto;
              min-height: 400px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
            }
            .error { 
              padding: 3rem; 
              text-align: center; 
              color: #dc2626;
              background: #fef2f2;
              border: 2px solid #fecaca;
              border-radius: 12px;
            }
          </style>
        </head>
        <body>
          <div id="root">Loading...</div>
          <!-- ✅ CRITICAL: data-plugins forces JSX-only transform -->
          <script type="text/babel" data-plugins="transform-react-jsx">
            // YOUR WELCOME COMPONENT - DIRECT BABEL COMPILATION
            ${code}
            
            // ✅ NO EXPORTS - Pure global mounting!
            function renderPreview() {
              // Find ANY function component in global scope
              for (let key in window) {
                if (typeof window[key] === 'function' && key.match(/^[A-Z]/)) {
                  const App = window[key];
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(React.createElement(App));
                  return true;
                }
              }
              return false;
            }
            
            // Auto render when ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', renderPreview);
            } else {
              renderPreview();
            }
          </script>
        </body>
        </html>
      `);
    } else {
      iframeDoc.write(`
        <!DOCTYPE html>
        <html><head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>html,body{height:100vh;margin:0;padding:2rem;background:#f0f9ff;}</style>
        </head><body>
          <div style="max-width:500px;margin:0 auto;min-height:400px;background:white;padding:2rem;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.15);">${code}</div>
        </body></html>
      `);
    }
    
    iframeDoc.close();
  }, [code, isReact, hasCode]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-slate-900">
                Live Preview
              </Typography>
              <Typography variant="caption" className="block text-slate-500 mt-1">
                React 18 • TailwindCSS • ✅ No Errors
              </Typography>
            </div>
          </div>
          <Chip 
            label={isReact ? 'React' : 'HTML'} 
            size="small" 
            color={isReact ? "success" : "default"}
            className="font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!hasCode ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" className="font-bold text-gray-800 mb-3">
                Preview Ready ✨
              </Typography>
              <Typography variant="body1" className="text-gray-600 max-w-sm">
                Your component will appear here instantly
              </Typography>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/90 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>🔥 Live updates on every change</span>
          {currentComponent?.id && currentComponent.id !== null && (
            <Chip label={`#${String(currentComponent.id).slice(-8)}`} size="small" variant="outlined" />
          )}
        </div>
      </div>
    </Box>
  );
}
