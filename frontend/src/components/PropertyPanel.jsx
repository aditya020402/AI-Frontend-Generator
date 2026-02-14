import React, { useState } from 'react';
import {
  Slider, Box, Typography, Grid, Chip, Switch, FormControlLabel
} from '@mui/material';
import { Palette, Layout, Typeography } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useComponentStore } from '../stores/componentStore';

export default function PropertyPanel() {
  const { cssProps, updateCSSProps } = useComponentStore();
  const [activeTab, setActiveTab] = useState('colors');

  const updateProp = (key, value) => {
    updateCSSProps({ ...cssProps, [key]: value });
  };

  const tailwindColors = {
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    shadows: ['0px 0px 0px', '0px 1px 3px rgba(0,0,0,0.1)', '0px 4px 6px rgba(0,0,0,0.1)', '0px 10px 15px rgba(0,0,0,0.1)']
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 py-3">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${activeTab === 'colors' ? 'bg-primary-50 border-b-2 border-primary-500 text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('colors')}
        >
          <Palette fontSize="small" />
          Colors
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${activeTab === 'layout' ? 'bg-primary-50 border-b-2 border-primary-500 text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('layout')}
        >
          <Layout fontSize="small" />
          Layout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'colors' && (
          <div>
            <Typography variant="subtitle1" className="font-semibold mb-4 flex items-center gap-2">
              🎨 Tailwind Colors
            </Typography>
            <div className="space-y-6">
              {['primary-color', 'bg-color', 'text-color'].map((prop) => (
                <div key={prop} className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {prop.replace('-color', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <ChromePicker
                    color={cssProps[prop] || '#3b82f6'}
                    onChangeComplete={(color) => updateProp(prop, color.hex)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {tailwindColors.colors.map((color, i) => (
                      <Chip
                        key={i}
                        size="small"
                        sx={{ 
                          backgroundColor: color,
                          height: 32,
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                        onClick={() => updateProp(prop, color)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div>
              <Typography variant="subtitle1" className="font-semibold mb-4">📐 Spacing</Typography>
              {['padding', 'margin', 'gap'].map((prop) => (
                <div key={prop} className="mb-6">
                  <label className="text-sm font-medium text-gray-700 block mb-2 capitalize">{prop}</label>
                  <Slider
                    value={parseFloat(cssProps[prop] || 1) * 10}
                    onChange={(_, v) => updateProp(prop, `${v / 10}rem`)}
                    min={0}
                    max={8}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div>
              <Typography variant="subtitle1" className="font-semibold mb-4">🎭 Effects</Typography>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Shadow</label>
                  <div className="flex gap-2 flex-wrap">
                    {tailwindColors.shadows.map((shadow, i) => (
                      <Chip
                        key={i}
                        label={['None', 'Sm', 'Md', 'Lg'][i]}
                        variant={cssProps.shadow === shadow ? 'filled' : 'outlined'}
                        onClick={() => updateProp('shadow', shadow)}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Border Radius</label>
                  <Slider
                    value={parseFloat(cssProps['border-radius']?.replace('rem', '') || 0.5) * 10}
                    onChange={(_, v) => updateProp('border-radius', `${v / 10}rem`)}
                    min={0}
                    max={3}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
