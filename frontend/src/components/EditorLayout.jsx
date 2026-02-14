import React from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Button, TextField, Box, IconButton } from '@mui/material';
import { Save, Download, Refresh, Send } from '@mui/icons-material';
import Editor from './Editor';
import LivePreview from './LivePreview';
import ChatSidebar from './ChatSidebar';
import PropertyPanel from './PropertyPanel';
import { useComponentStore } from '../stores/componentStore';

export default function EditorLayout({ componentId }) {
  const { framework, setFramework } = useComponentStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <AppBar className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-md z-50" elevation={0}>
        <Toolbar className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Typography variant="h6" className="font-bold text-gray-900 flex-1">
            AI Component Editor
          </Typography>
          
          {/* Framework Selector */}
          <div className="flex items-center gap-4 mx-4">
            <Select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              size="small"
              className="min-w-[140px] border-gray-300 shadow-sm"
            >
              <MenuItem value="react">React + Tailwind</MenuItem>
              <MenuItem value="html-css-js">HTML/CSS/JS</MenuItem>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button startIcon={<Save />} className="btn-secondary text-sm" size="small">
              Save
            </Button>
            <Button startIcon={<Download />} className="btn-primary text-sm" size="small">
              Download
            </Button>
            <Button startIcon={<Refresh />} className="!text-gray-600 hover:!bg-gray-100" size="small">
              Regenerate
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      {/* Main Layout: Editor | Preview | Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor - 40% */}
        <div className="w-[40%] border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Code className="text-primary-600" />
              <span>Code Editor</span>
            </div>
          </div>
          <div className="flex-1 monaco-container">
            <Editor />
          </div>
        </div>

        {/* Preview + Chat - 60% */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
          {/* Live Preview */}
          <div className="flex-1 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                </span>
                <span>Live Preview</span>
              </div>
            </div>
            <div className="flex-1 p-4 preview-iframe">
              <LivePreview />
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full lg:w-80 border-l border-gray-200 flex flex-col bg-gray-50">
            <ChatSidebar />
          </div>
        </div>
      </div>

      {/* Bottom Property Panel */}
      <div className="h-64 border-t border-gray-200 bg-white shadow-lg">
        <PropertyPanel />
      </div>
    </div>
  );
}
