import React from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useComponentStore } from '../stores/componentStore';
import { Palette, Typography as TypographyIcon, Spacing } from '@mui/icons-material';

export default function PropertyPanel() {
  const { currentComponent, updateCode } = useComponentStore();

  // ✅ SAFE CSS PROPS - Prevents "primary-color" undefined error
  const cssProps = currentComponent?.css_props || {};
  const code = currentComponent?.current_code || '';

  // Safe property access with fallbacks
  const getProp = (key, defaultValue = '') => cssProps[key] || defaultValue;
  const setProp = (key, value) => {
    const newProps = { ...cssProps, [key]: value };
    
    // Update store
    updateCode(code.replace(
      /style\s*=\s*\{[^{}]*--[^:}*:[^}]*\}/,
      `style={{ ${Object.entries(newProps)
        .map(([k, v]) => `${k}: '${v}'`)
        .join(', ')} }}`
    ) || `style={{ ${Object.entries(newProps)
      .map(([k, v]) => `${k}: '${v}'`)
      .join(', ')} }}`);
  };

  const handleColorChange = (key) => (e) => {
    setProp(key, e.target.value);
  };

  const handleSliderChange = (key, min = 0, max = 100) => (e, value) => {
    setProp(key, `${value}px`);
  };

  const resetProps = () => {
    setProp('--primary-color', '#3b82f6');
    setProp('--bg-color', '#ffffff');
    setProp('--text-color', '#1f2937');
    setProp('--padding', '2rem');
    setProp('--margin', '1rem');
    setProp('--border-radius', '0.5rem');
  };

  if (!currentComponent) {
    return (
      <Paper className="h-full flex flex-col p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl border border-gray-200">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Palette className="w-20 h-20 text-gray-400 mb-6" />
          <Typography variant="h6" className="font-bold text-gray-700 mb-2">
            Select a Component
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Choose a component to edit its properties
          </Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="h-full flex flex-col overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-10 h-10 text-indigo-600" />
            <div>
              <Typography variant="subtitle1" className="font-bold text-gray-900">
                Properties
              </Typography>
              <Chip 
                label={currentComponent.framework?.toUpperCase() || 'REACT'} 
                size="small" 
                className="mt-1 bg-blue-100 text-blue-800" 
              />
            </div>
          </div>
          <IconButton onClick={resetProps} title="Reset to defaults">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Colors */}
        <div>
          <Typography variant="subtitle2" className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            Colors
          </Typography>
          
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Primary Color"
              value={getProp('--primary-color', '#3b82f6')}
              onChange={handleColorChange('--primary-color')}
              type="color"
              size="small"
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div className="w-8 h-8 rounded border-2 border-gray-200" 
                         style={{ backgroundColor: getProp('--primary-color', '#3b82f6') }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiInputBase-root': { height: 50 } }}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Background"
                value={getProp('--bg-color', '#ffffff')}
                onChange={handleColorChange('--bg-color')}
                type="color"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div className="w-6 h-6 rounded" 
                           style={{ backgroundColor: getProp('--bg-color', '#ffffff') }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Text Color"
                value={getProp('--text-color', '#1f2937')}
                onChange={handleColorChange('--text-color')}
                type="color"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div className="w-6 h-6 rounded" 
                           style={{ backgroundColor: getProp('--text-color', '#1f2937') }} />
                    </InputAdornment>
                  )
                }}
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* Spacing */}
        <div>
          <Typography variant="subtitle2" className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Spacing className="w-5 h-5 text-green-600" />
            Spacing
          </Typography>
          
          <div className="space-y-4">
            <div>
              <Typography variant="caption" className="block text-gray-500 mb-2">Padding</Typography>
              <Slider
                value={parseInt(getProp('--padding', '32').replace('px', '') || 32)}
                onChange={handleSliderChange('--padding', 0, 100)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                className="mt-2"
              />
            </div>
            
            <div>
              <Typography variant="caption" className="block text-gray-500 mb-2">Margin</Typography>
              <Slider
                value={parseInt(getProp('--margin', '16').replace('px', '') || 16)}
                onChange={handleSliderChange('--margin', 0, 50)}
                min={0}
                max={50}
                valueLabelDisplay="auto"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* Typography */}
        <div>
          <Typography variant="subtitle2" className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TypographyIcon className="w-5 h-5 text-purple-600" />
            Typography
          </Typography>
          
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Font Size"
              value={getProp('--font-size', '16px')}
              onChange={(e) => setProp('--font-size', e.target.value)}
              size="small"
              className="w-full"
            />
            <TextField
              label="Line Height"
              value={getProp('--line-height', '1.5')}
              onChange={(e) => setProp('--line-height', e.target.value)}
              size="small"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <Button
          fullWidth
          variant="contained"
          onClick={resetProps}
          className="rounded-xl shadow-lg font-semibold py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Reset All Properties
        </Button>
      </div>
    </Paper>
  );
}
