import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useComponentStore } from '../stores/componentStore.js';

export default function LivePreview() {
  const iframeRef = useRef();
  const { code, cssProps, updateCode } = useComponentStore();

  const injectCSS = useCallback((iframeDoc) => {
    if (!iframeDoc) return;

    // Inject CSS variables
    const cssVars = Object.entries(cssProps)
      .map(([key, value]) => `--${key}: ${value}`)
      .join(';');
    
    let style = iframeDoc.querySelector('style[data-live-css]');
    if (!style) {
      style = iframeDoc.createElement('style');
      style.dataset.liveCss = 'true';
      iframeDoc.head.appendChild(style);
    }
    style.textContent = `:root {${cssVars}}`;
  }, [cssProps]);

  useEffect(() => {
    if (!iframeRef.current?.contentDocument) return;

    const iframeDoc = iframeRef.current.contentDocument;
    injectCSS(iframeDoc);

    // Watch for code changes in iframe
    const observer = new MutationObserver(() => {
      try {
        const newCode = iframeDoc.documentElement.outerHTML;
        updateCode(newCode);
      } catch (e) {
        // Ignore iframe content errors
      }
    });

    observer.observe(iframeDoc.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, [code, cssProps, injectCSS, updateCode]);

  const srcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${code.includes('React') ? `
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          :root {
            --primary-color: #3b82f6;
            --bg-color: #ffffff;
            --text-color: #1f2937;
          }
        </style>
      ` : ''}
    </head>
    <body style="margin:0;padding:2rem;min-height:100vh;background:#f8fafc;">
      <div id="root" style="max-width:500px;margin:0 auto;"></div>
      <script>
        ${code.includes('React') ? `
          const root = ReactDOM.createRoot(document.getElementById('root'));
          ${code}
          root.render(<MyComponent />);
        ` : code}
      </script>
    </body>
    </html>`;

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#f8fafc'
        }}
        title="Live Preview"
      />
    </Box>
  );
}
