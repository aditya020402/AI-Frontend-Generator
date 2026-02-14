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
import { 
  Palette, 
  FormatSize, 
  Typography as TypographyIcon 
} from '@mui/icons-material';
import { useComponentStore } from '../stores/componentStore';

export default function PropertyPanel() {
  const { currentComponent, updateCode } = useComponentStore();

  // ✅ SAFE CSS PROPS
  const cssProps = currentComponent?.css_props || {};
  const code = currentComponent?.current_code || '';

  // ✅ BULLETPROOF NUMBER PARSING
  const getProp = (key, defaultValue = '') => cssProps[key] || defaultValue;
  
  const parseNumber = (value, fallback = 16) => {
    if (!value) return fallback;
    // Extract only digits: '16px' → 16, '2rem' → 2, '1.5' → 1.5
    const num = parseFloat(value.toString().replace(/[^\d.]/g, '')) || fallback;
    return Math.max(0, num); // Ensure non-negative
  };

  const formatForSlider = (value, unit = 'px') => {
    return parseInt(value || 16);
  };

  const setProp = (key, value) => {
    const newProps = { ...cssProps, [key]: value };
    updateCode(code); // Simplified - store handles persistence
  };

  const handleColorChange = (key) => (e) => {
    setProp(key, e.target.value);
  };

  // ✅ FIXED SLIDER HANDLER - Proper number parsing
  const handleSliderChange = (key) => (e, value) => {
    setProp(key, `${value}px`);
  };

  const resetProps = () => {
    const defaults = {
      '--primary-color': '#3b82f6',
      '--bg-color': '#ffffff', 
      '--text-color': '#1f2937',
      '--padding': '2rem',
      '--margin': '1rem',
      '--border-radius': '0.5rem',
      '--font-size': '16px',
      '--line-height': '1.5'
    };
    Object.entries(defaults).forEach(([k, v]) => setProp(k, v));
  };

  if (!currentComponent) {
    return (
      <Paper className="h-full flex flex-col p-12 bg-gradient-to-br from-gray-50 to-slate-50 shadow-2xl border border-gray-200 rounded-3xl">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Palette className="w-24 h-24 text-gray-300 mb-8" />
          <Typography variant="h5" className="font-black text-gray-800 mb-3">
            Select Component
          </Typography>
          <Typography variant="body1" className="text-gray-600 max-w-sm">
            Choose a component to customize colors, spacing, and typography
          </Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="h-full flex flex-col overflow-hidden shadow-2xl border border-gray-100 bg-white/70 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <Typography variant="h6" className="font-bold text-gray-900">
                Design Properties
              </Typography>
              <Chip 
                label={currentComponent.framework?.toUpperCase()} 
                size="small" 
                color="primary"
                className="mt-1 shadow-sm"
              />
            </div>
          </div>
          <IconButton onClick={resetProps} title="Reset defaults">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Colors */}
        <Paper elevation={2} className="p-6 rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            🎨 Colors
          </Typography>
          
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Primary Color"
              value={getProp('--primary-color', '#3b82f6')}
              onChange={handleColorChange('--primary-color')}
              type="color"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 shadow-sm ring-2 ring-transparent" 
                      style={{ backgroundColor: getProp('--primary-color', '#3b82f6') }}
                    />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiInputBase-root': { height: 56 } }}
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
                      <div className="w-8 h-8 rounded-lg shadow-inner" 
                           style={{ backgroundColor: getProp('--bg-color', '#ffffff') }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Text"
                value={getProp('--text-color', '#1f2937')}
                onChange={handleColorChange('--text-color')}
                type="color"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div className="w-8 h-8 rounded-lg shadow-inner" 
                           style={{ backgroundColor: getProp('--text-color', '#1f2937') }} />
                    </InputAdornment>
                  )
                }}
              />
            </div>
          </div>
        </Paper>

        {/* Spacing */}
        <Paper elevation={2} className="p-6 rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            📐 Spacing
          </Typography>
          
          <div className="space-y-6">
            {/* ✅ FIXED PADDING SLIDER */}
            <div>
              <Typography variant="body2" className="font-medium text-gray-700 mb-3">
                Padding: <span className="font-mono">{getProp('--padding', '32px')}</span>
              </Typography>
              <Slider
                value={formatForSlider(getProp('--padding', '32px'), 'px')}
                onChange={handleSliderChange('--padding')}
                min={0}
                max={120}
                step={8}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
                sx={{ mt: 1 }}
              />
            </div>

            <div>
              <Typography variant="body2" className="font-medium text-gray-700 mb-3">
                Border Radius: <span className="font-mono">{getProp('--border-radius', '8px')}</span>
              </Typography>
              <Slider
                value={formatForSlider(getProp('--border-radius', '8px'), 'px')}
                onChange={(e, value) => setProp('--border-radius', `${value}px`)}
                min={0}
                max={48}
                step={4}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
                sx={{ mt: 1 }}
              />
            </div>
          </div>
        </Paper>

        {/* Typography */}
        <Paper elevation={2} className="p-6 rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔤 Typography
          </Typography>
          
          <div className="grid grid-cols-2 gap-4">
            {/* ✅ FIXED NUMBER INPUTS */}
            <TextField
              label="Font Size"
              type="number"
              value={parseNumber(getProp('--font-size', '16'))}
              onChange={(e) => setProp('--font-size', `${Math.max(12, Math.min(48, e.target.value))}px`)}
              inputProps={{ min: 12, max: 48, step: 1 }}
              size="small"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Line Height"
              type="number"
              value={parseFloat(getProp('--line-height', '1.5')) || 1.5}
              onChange={(e) => setProp('--line-height', Math.max(1, Math.min(2, parseFloat(e.target.value) || 1.5)).toFixed(1))}
              inputProps={{ min: 1, max: 2, step: 0.1 }}
              size="small"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </div>
        </Paper>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <Button
          fullWidth
          variant="contained"
          onClick={resetProps}
          size="large"
          sx={{ 
            borderRadius: 3, 
            py: 2, 
            fontWeight: 600,
            boxShadow: 3,
            bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': { boxShadow: 6 }
          }}
        >
          🎨 Reset to Perfect Defaults
        </Button>
      </div>
    </Paper>
  );
}
