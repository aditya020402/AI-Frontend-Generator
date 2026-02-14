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
  FormatSize,  // ✅ FIXED: Use FormatSize instead of Spacing
  Typography as TypographyIcon 
} from '@mui/icons-material';
import { useComponentStore } from '../stores/componentStore';

export default function PropertyPanel() {
  const { currentComponent, updateCode } = useComponentStore();

  // ✅ SAFE CSS PROPS - Prevents undefined errors
  const cssProps = currentComponent?.css_props || {};
  const code = currentComponent?.current_code || '';

  // Safe property access
  const getProp = (key, defaultValue = '') => cssProps[key] || defaultValue;
  
  const setProp = (key, value) => {
    const newProps = { ...cssProps, [key]: value };
    
    // Update code with new CSS custom properties
    const newStyle = `style={{ ${Object.entries(newProps)
      .map(([k, v]) => `${k}: '${v}'`)
      .join(', ')} }}`;
    
    // Replace or add style prop in code
    let updatedCode = code;
    if (code.includes('style={{')) {
      updatedCode = code.replace(/style\s*=\s*\{[^{}]*\}/, newStyle);
    } else {
      // Add style prop to first JSX element
      updatedCode = code.replace(
        /(<\w+)/, 
        `$1 style={{ ${Object.entries(newProps).map(([k, v]) => `${k}: '${v}'`).join(', ')} }}`
      );
    }
    
    updateCode(updatedCode);
  };

  const handleColorChange = (key) => (e) => {
    setProp(key, e.target.value);
  };

  const handleSliderChange = (key, min = 0, max = 100) => (e, value) => {
    setProp(key, `${value}px`);
  };

  const resetProps = () => {
    const defaults = {
      '--primary-color': '#3b82f6',
      '--bg-color': '#ffffff', 
      '--text-color': '#1f2937',
      '--padding': '2rem',
      '--margin': '1rem',
      '--border-radius': '0.5rem'
    };
    
    Object.entries(defaults).forEach(([key, value]) => setProp(key, value));
  };

  if (!currentComponent) {
    return (
      <Paper className="h-full flex flex-col p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl border border-gray-200 rounded-t-3xl">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Palette className="w-20 h-20 text-gray-400 mb-6 opacity-60" />
          <Typography variant="h6" className="font-bold text-gray-700 mb-2">
            No Component Selected
          </Typography>
          <Typography variant="body2" className="text-gray-500 max-w-sm">
            Select a component from the library to customize its design properties
          </Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className="h-full flex flex-col overflow-hidden shadow-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-12 h-12 text-indigo-600 shadow-lg bg-indigo-100 rounded-xl p-2" />
            <div>
              <Typography variant="h6" className="font-bold text-gray-900">
                Design Properties
              </Typography>
              <Chip 
                label={currentComponent.framework?.toUpperCase() || 'REACT'} 
                size="small" 
                className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md" 
              />
            </div>
          </div>
          <IconButton 
            onClick={resetProps} 
            className="p-2 hover:bg-indigo-100 rounded-xl shadow-sm"
            title="Reset to Tailwind defaults"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {/* Colors */}
        <Paper className="p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-600" />
            Color Palette
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
                      className="w-10 h-10 rounded-lg border-2 shadow-sm" 
                      style={{ backgroundColor: getProp('--primary-color', '#3b82f6') }}
                    />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiInputBase-root': { height: 56, borderRadius: '16px' } }}
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
                      <div 
                        className="w-8 h-8 rounded-lg shadow-inner" 
                        style={{ backgroundColor: getProp('--bg-color', '#ffffff') }}
                      />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '12px' } }}
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
                      <div 
                        className="w-8 h-8 rounded-lg shadow-inner" 
                        style={{ backgroundColor: getProp('--text-color', '#1f2937') }}
                      />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiInputBase-root': { borderRadius: '12px' } }}
              />
            </div>
          </div>
        </Paper>

        {/* Spacing */}
        <Paper className="p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FormatSize className="w-6 h-6 text-green-600" />  {/* ✅ FIXED: FormatSize */}
            Spacing & Size
          </Typography>
          
          <div className="space-y-6">
            <div>
              <Typography variant="caption" className="block text-gray-600 font-medium mb-4">
                Padding ({getProp('--padding', '2rem')})
              </Typography>
              <Slider
                value={parseInt((getProp('--padding', '32px') || '32').replace(/[^\d]/g, '')) || 32}
                onChange={handleSliderChange('--padding', 0, 120)}
                min={0}
                max={120}
                step={4}
                valueLabelDisplay="auto"
                className="mt-4"
                sx={{ 
                  '& .MuiSlider-track': { borderRadius: '8px' },
                  '& .MuiSlider-rail': { borderRadius: '8px' }
                }}
              />
            </div>
            
            <div>
              <Typography variant="caption" className="block text-gray-600 font-medium mb-4">
                Border Radius ({getProp('--border-radius', '0.5rem')})
              </Typography>
              <Slider
                value={parseInt((getProp('--border-radius', '8px') || '8').replace(/[^\d]/g, '')) || 8}
                onChange={handleSliderChange('--border-radius', 0, 32)}
                min={0}
                max={32}
                step={2}
                valueLabelDisplay="auto"
                className="mt-4"
                sx={{ 
                  '& .MuiSlider-track': { borderRadius: '8px' },
                  '& .MuiSlider-rail': { borderRadius: '8px' }
                }}
              />
            </div>
          </div>
        </Paper>

        {/* Typography */}
        <Paper className="p-6 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
          <Typography variant="subtitle1" className="font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TypographyIcon className="w-6 h-6 text-purple-600" />
            Typography
          </Typography>
          
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Font Size"
              value={getProp('--font-size', '16px')}
              onChange={(e) => setProp('--font-size', e.target.value)}
              size="small"
              type="number"
              inputProps={{ min: 12, max: 48, step: 1 }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Line Height"
              value={getProp('--line-height', '1.5')}
              onChange={(e) => setProp('--line-height', e.target.value)}
              size="small"
              type="number"
              inputProps={{ min: 1, max: 2, step: 0.1 }}
              sx={{ '& .MuiInputBase-root': { borderRadius: '12px' } }}
            />
          </div>
        </Paper>
      </div>

      {/* Actions */}
      <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50/50">
        <Button
          fullWidth
          variant="contained"
          onClick={resetProps}
          size="large"
          className="rounded-2xl shadow-xl font-semibold py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-shadow-sm"
        >
          🎨 Reset to Tailwind Defaults
        </Button>
      </div>
    </Paper>
  );
}
