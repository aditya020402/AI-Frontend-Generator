import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Chip 
} from '@mui/material';
import { useComponentStore } from '../stores/componentStore';

export default function LivePreview() {
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const { currentComponent, framework } = useComponentStore();

  // ✅ FIXED: Get code from store OR show empty state
  const code = currentComponent?.current_code || '';
  const hasValidCode = code && code.trim() && !code.includes('// Generating...');
  
  // ✅ FIXED: Simple React detection
  const isReact = framework === 'react' || 
                  code.includes('className') || 
                  code.includes('React.') ||
                  code.includes('useState') ||
                  code.includes('useEffect');

  useEffect(() => {
    // Always clear first
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }

    if (!hasValidCode) {
      // ✅ Show beautiful empty state - NO LOADER
      if (previewRef.current) {
        previewRef.current.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border-2 border-dashed border-blue-200">
            <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Live Preview Ready ✨</h3>
              <p class="text-lg text-gray-600 max-w-sm leading-relaxed">
                ${currentComponent ? 'Your code will appear here instantly!' : 'Chat with AI to generate your first component'}
              </p>
            </div>
          </div>
        `;
      }
      return;
    }

    if (isReact) {
      // ✅ REACT PREVIEW - Fixed iframe logic
      const iframe = iframeRef.current;
      if (iframe && code) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
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
                  html, body { 
                    height: 100vh; 
                    overflow: hidden; 
                    background: #f8fafc;
                    padding: 2rem 1rem;
                    font-family: ui-sans-serif, system-ui, sans-serif;
                  }
                  #root { 
                    min-height: 400px; 
                    max-width: 500px; 
                    margin: 0 auto;
                  }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script type="text/babel">
                  ${code}
                  const App = typeof module !== 'undefined' && module.exports 
                    ? module.exports.default || module.exports 
                    : (window.exports?.default || window.exports || (() => {
                        const scripts = document.scripts;
                        for(let i = scripts.length - 2; i >= 0; i--) {
                          if(scripts[i].type === 'text/babel') {
                            const func = new Function('React', 'ReactDOM', scripts[i].textContent);
                            return func(React, ReactDOM);
                          }
                        }
                        return null;
                      })());
                  
                  if(App) {
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(App));
                  } else {
                    document.getElementById('root').innerHTML = '<div class="p-12 text-center text-gray-500"><h3>Component not found</h3><p>Make sure your code exports a default React component</p></div>';
                  }
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      }
    } else {
      // ✅ HTML PREVIEW
      if (previewRef.current) {
        previewRef.current.innerHTML = `
          <div style="min-height: 400px; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            ${code}
          </div>
        `;
        
        // Execute inline scripts safely
        const scripts = Array.from(previewRef.current.querySelectorAll('script'));
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        });
      }
    }
  }, [code, isReact, hasValidCode, framework]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-emerald-100/50">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <Typography variant="h6" className="font-black text-slate-900 tracking-tight">
                Live Preview
              </Typography>
              <Typography variant="caption" className="block text-slate-500 font-medium mt-1 bg-slate-100 px-2 py-0.5 rounded-full">
                {framework.toUpperCase()} • Real-time
              </Typography>
            </div>
          </div>
          
          <Chip 
            label={isReact ? 'React 18 + Tailwind' : 'HTML/CSS/JS'} 
            size="small" 
            color="success"
            variant="filled"
            className="font-mono shadow-lg hover:shadow-xl transition-all"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        {isReact ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-transparent shadow-inner"
            sandbox="allow-scripts allow-same-origin"
            title="Live React Preview"
          />
        ) : (
          <div 
            ref={previewRef}
            className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 to-white"
            style={{ minHeight: '400px' }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>🔥 Updates instantly with code changes</span>
          {currentComponent?.id && (
            <Chip 
              label={`Component #${currentComponent.id.slice(-8)}`} 
              size="small" 
              variant="outlined" 
              color="info"
            />
          )}
        </div>
      </div>
    </Box>
  );
}
