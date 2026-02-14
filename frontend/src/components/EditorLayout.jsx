import React from 'react';
import {
  Box, Grid, AppBar, Toolbar, Typography, Select,
  MenuItem, Button, TextField, IconButton, Paper
} from '@mui/material';
import { Editor, LivePreview, ChatSidebar, PropertyPanel } from './index';
import CodeIcon from '@mui/icons-material/Code';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function EditorLayout({ componentId }) {
  const { framework, setFramework } = useComponentStore();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <AppBar position="sticky" color="default" elevation={1} sx={{ zIndex: 1200 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Component Editor
          </Typography>
          <Select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            size="small"
          >
            <MenuItem value="react">React + Tailwind</MenuItem>
            <MenuItem value="html-css-js">HTML/CSS/JS</MenuItem>
          </Select>
          <Button startIcon={<SaveIcon />} sx={{ mx: 1 }}>Save</Button>
          <Button startIcon={<DownloadIcon />} sx={{ mx: 1 }}>Download</Button>
          <Button startIcon={<RefreshIcon />}>Regenerate</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Editor (40%) */}
        <Box sx={{ width: '40%', height: '100%', borderRight: 1, borderColor: 'divider' }}>
          <Editor />
        </Box>

        {/* Preview + Chat (60%) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Preview Row */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Box sx={{ flex: 1, p: 2, borderRight: 1, borderColor: 'divider' }}>
              <LivePreview />
            </Box>
            {/* Chat Sidebar */}
            <Box sx={{ width: 320, borderLeft: 1, borderColor: 'divider' }}>
              <ChatSidebar />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Property Panel */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <PropertyPanel />
      </Paper>
    </Box>
  );
}
