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

  // ✅ SAFE CODE EXTRACTION - No undefined errors
  const code = currentComponent?.current_code || `
    function DefaultPreview() {
      return (
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome! 👋</h2>
          <p className="text-gray-600 mb-8">Select a component or chat with AI to generate code</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            Ready to Build ✨
          </button>
        </div>
      );
    }
    export default DefaultPreview;
    `;
    
  const isEmpty = !code || 
                  code.trim() === '' || 
                  code.trim() === '// Generating...' || 
                  code.includes('function') === false;
  
  // ✅ SAFE REACT DETECTION
  const isReact = framework === 'react' || 
                  code.includes('React') || 
                  code.includes('className') || 
                  code.includes('jsx') ||
                  code.includes('useState') ||
                  code.includes('useEffect');

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    // Clear previous content
    preview.innerHTML = '';

    if (isEmpty) {
      // Beautiful empty state
      preview.innerHTML = `
        <div class="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Preview Available</h3>
          <p class="text-gray-600 mb-8 max-w-sm">${currentComponent ? 'Edit code on the left to see live preview' : 'Select or create a component'}</p>
        </div>
      `;
      return;
    }

    if (isReact) {
      // ✅ REACT PREVIEW - UNPKG CDN (No blocks!)
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <!-- ✅ RELIABLE CDNs - Never blocked in India/Chrome -->
              <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { 
                  height: 100%; 
                  overflow: hidden; 
                  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                  padding: 2rem;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                #root { 
                  min-height: 400px; 
                  max-width: 600px; 
                  margin: 0 auto;
                  border-radius: 16px;
                  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .preview-container {
                  background: white;
                  padding: 2rem;
                  border-radius: 16px;
                  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <div id="root" class="preview-container"></div>
              <script type="text/babel">
                try {
                  ${code}
                  
                  // Auto-mount first export
                  const App = typeof window.exports !== 'undefined' 
                    ? window.exports.default || window.exports 
                    : eval('(' + document.currentScript.previousElementSibling.textContent + ')');
                  
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(React.createElement(App));
                } catch (error) {
                  document.getElementById('root').innerHTML = 
                    '<div class="p-8 text-center text-red-600"><h3>Preview Error</h3><p>' + error.message + '</p></div>';
                }
              </script>
            </body>
            </html>
        `);
        iframeDoc.close();
      }
    } else {
      // ✅ HTML/CSS/JS PREVIEW - Direct injection
      preview.innerHTML = `
        <div style="padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 400px; border-radius: 16px;">
          ${code}
        </div>
      `;
      
      // Safely execute scripts
      const scripts = Array.from(preview.getElementsByTagName('script'));
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        script.parentNode.replaceChild(newScript, script);
      });
    }
  }, [code, isReact, isEmpty, currentComponent]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white/90 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <Typography variant="h6" className="font-black text-slate-900 tracking-tight">
                Live Preview
              </Typography>
              <Typography variant="caption" className="block text-slate-500 font-medium mt-1">
                Real-time updates • React + TailwindCSS
              </Typography>
            </div>
          </div>
          
          <Chip 
            label={isReact ? 'React 18' : 'HTML/CSS/JS'} 
            size="small" 
            color="primary"
            variant="filled"
            className="font-semibold shadow-md hover:shadow-lg transition-all"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative bg-white/50">
        {isEmpty ? (
          <div ref={previewRef} className="h-full flex items-center justify-center p-8" />
        ) : isReact ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts"
            title="Live React Preview"
            loading="lazy"
          />
        ) : (
          <div 
            ref={previewRef}
            className="w-full h-full p-8 overflow-auto"
            style={{ minHeight: '400px' }}
          />
        )}
        
        {/* Loading Overlay */}
        {isEmpty && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-slate-100/90 backdrop-blur-2xl flex flex-col items-center justify-center z-30">
            <div className="text-center p-12 space-y-4">
              <CircularProgress size={56} thickness={4} className="text-emerald-600" />
              <div>
                <Typography variant="h5" className="font-bold text-slate-800 mb-2">
                  Ready for Preview
                </Typography>
                <Typography variant="body1" className="text-slate-600">
                  {!currentComponent 
                    ? 'Select a component from the library' 
                    : 'Code is loading in preview...'
                  }
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>🔥 Auto-refreshes on code changes</span>
          {currentComponent?.id && (
            <Chip 
              label={`#${currentComponent.id.slice(-8)}`} 
              size="small" 
              variant="outlined" 
              className="backdrop-blur-sm"
            />
          )}
        </div>
      </div>
    </Box>
  );
}
