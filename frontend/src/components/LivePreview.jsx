import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Skeleton, Paper } from '@mui/material';
import { PlayCircle, Refresh } from '@mui/icons-material';
import { useComponentStore } from '../stores/componentStore.js';

export default function LivePreview() {
  const iframeRef = useRef();
  const { code, cssProps, updateCode, framework } = useComponentStore();
  const [previewReady, setPreviewReady] = useState(false);

  const injectCSS = useCallback((iframeDoc) => {
    if (!iframeDoc) return;

    // Dynamic CSS variables injection
    const cssVars = Object.entries(cssProps)
      .filter(([_, v]) => v)
      .map(([k, v]) => `--${k}: ${v}`)
      .join(';');

    // Create/update CSS injection
    let style = iframeDoc.querySelector('style[data-tailwind-live]');
    if (!style) {
      style = iframeDoc.createElement('style');
      style.dataset.tailwindLive = 'true';
      iframeDoc.head.appendChild(style);
    }
    style.textContent = `:root { ${cssVars}; }`;

    // Tailwind config for custom colors
    let configScript = iframeDoc.querySelector('script[data-tailwind-config]');
    if (!configScript) {
      configScript = iframeDoc.createElement('script');
      configScript.dataset.tailwindConfig = 'true';
      iframeDoc.head.appendChild(configScript);
    }
    configScript.textContent = `
      tailwind.config = {
        theme: { extend: { colors: { primary: 'var(--primary-color, #3b82f6)' } } }
      }
    `;
  }, [cssProps]);

  useEffect(() => {
    if (iframeRef.current?.contentDocument && iframeRef.current.contentWindow) {
      const iframeDoc = iframeRef.current.contentDocument;
      injectCSS(iframeDoc);
      setPreviewReady(true);

      // Mutation observer for live sync
      const observer = new MutationObserver(() => {
        try {
          updateCode(iframeDoc.documentElement.outerHTML);
        } catch (e) {}
      });

      observer.observe(iframeDoc.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      return () => observer.disconnect();
    }
  }, [code, cssProps, injectCSS, updateCode]);

  const getSrcDoc = () => {
    const baseTemplate = `
      <!DOCTYPE html>
      <html class="h-full">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Live Preview - ${framework}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      </head>
      <body class="min-h-screen bg-gray-50 p-8 antialiased">
        <div id="root" class="max-w-4xl mx-auto rounded-2xl shadow-xl bg-white border border-gray-200 p-8"></div>
        <script>
          ${framework === 'react' ? `
            const { useState, useEffect } = React;
            ${code}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(MyComponent));
          ` : code}
        </script>
      </body>
      </html>`;

    return baseTemplate;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Preview Header */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            <Typography variant="subtitle2" className="font-semibold text-gray-900 flex items-center gap-2">
              Live Preview <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Ready</span>
            </Typography>
          </div>
          <IconButton size="small" className="text-gray-500 hover:bg-gray-100">
            <Refresh className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 relative overflow-hidden">
        {previewReady ? (
          <iframe
            ref={iframeRef}
            srcDoc={getSrcDoc()}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-none shadow-inner"
            title="Live Tailwind Preview"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-gray-50">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
              <PlayCircle className="w-12 h-12 text-gray-400" />
            </div>
            <Typography variant="h6" className="text-gray-900 mb-2 font-semibold">
              Preview Loading...
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-8 text-center">
              Your Tailwind component will appear here instantly
            </Typography>
            <Skeleton variant="rectangular" width="100%" height={400} className="rounded-xl" />
          </div>
        )}
      </div>

      {/* Device Frame Overlay (Optional) */}
      <div className="absolute inset-4 bg-transparent border-4 border-gray-200 rounded-3xl shadow-2xl pointer-events-none opacity-30 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-2 bg-white/50 rounded-2xl"></div>
      </div>
    </div>
  );
}
