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

  // ✅ SIMPLIFIED: Just get code, no complex fallback logic
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
      // ✅ FIXED: Simple React mounting - NO "exports" error
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
          <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { 
              height: 100vh; 
              overflow: hidden; 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 2rem;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
            #root { 
              max-width: 500px; 
              margin: 0 auto;
              min-height: 400px;
            }
            .error { 
              padding: 2rem; 
              text-align: center; 
              color: #dc2626; 
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div id="root">Loading...</div>
          <script type="text/babel">
            // ✅ FIXED: Simple function extraction - NO exports needed
            function extractComponent(code) {
              const func = new Function('React', 'ReactDOM', code + '; return typeof defaultExport !== "undefined" ? defaultExport : (typeof exports !== "undefined" ? exports.default || exports : null)');
              return func(React, ReactDOM);
            }
            
            try {
              const Component = extractComponent(\`${code.replace(/`/g, '\\`')}\`);
              
              if (Component) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(Component));
              } else {
                throw new Error('No default export found');
              }
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div class="error"><h3>⚠️ Preview Error</h3><p>' + error.message + '</p><p>Check your component syntax</p></div>';
            }
          </script>
        </body>
        </html>
      `);
    } else {
      // ✅ HTML/CSS/JS - Direct render
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
          <style>html,body{height:100vh;margin:0;padding:2rem;background:#f0f9ff;}</style>
        </head>
        <body>
          <div style="max-width:500px;margin:0 auto;min-height:400px;background:white;padding:2rem;border-radius:12px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">${code}</div>
        </body>
        </html>
      `);
    }
    
    iframeDoc.close();
  }, [code, isReact, hasCode]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
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
                React 18 • TailwindCSS • Instant updates
              </Typography>
            </div>
          </div>
          
          <Chip 
            label={isReact ? 'React' : 'HTML'} 
            size="small" 
            color={isReact ? "success" : "default"}
            className="font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-slate-50 to-white">
        {!hasCode ? (
          // ✅ Beautiful empty state - NO spinner!
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" className="font-bold text-gray-800 mb-3">
                Ready to Preview ✨
              </Typography>
              <Typography variant="body1" className="text-gray-600 max-w-sm">
                {currentComponent ? 'Your code appears here instantly!' : 'Chat with AI to generate components'}
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

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/90 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>🔄 Auto-refreshes on every keystroke</span>
          {currentComponent?.id && (
            <Chip label={`#${currentComponent.id.slice(-8)}`} size="small" variant="outlined" />
          )}
        </div>
      </div>
    </Box>
  );
}
