import React, { useState } from 'react';
import {
  Slider, Box, Typography, Chip, Tabs, Tab,
  FormControlLabel, Switch, Divider
} from '@mui/material';
// ✅ THESE ICONS 100% EXIST IN @mui/icons-material
import { Palette, Dashboard, FormatSize } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useComponentStore } from '../stores/componentStore';

export default function PropertyPanel() {
  const { cssProps, updateCSSProps } = useComponentStore();
  const [activeTab, setActiveTab] = useState(0);

  const updateProp = (key, value) => {
    updateCSSProps({ ...cssProps, [key]: value });
  };

  const tailwindColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Tab Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 sticky top-0 z-10">
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          className="!bg-gray-50 !rounded-xl"
        >
          <Tab 
            icon={<Palette />} 
            label="Colors"
            className="!min-h-12 font-medium data-[highlighted=true]:!bg-blue-50 data-[selected=true]:!bg-blue-50 text-gray-700 data-[selected=true]:text-blue-600"
          />
          <Tab 
            icon={<Dashboard />} 
            label="Layout"
            className="!min-h-12 font-medium data-[highlighted=true]:!bg-gray-50 data-[selected=true]:!bg-gray-50 text-gray-700 data-[selected=true]:text-gray-900"
          />
          <Tab 
            icon={<FormatSize />} 
            label="Typography"
            className="!min-h-12 font-medium data-[highlighted=true]:!bg-gray-50 data-[selected=true]:!bg-gray-50 text-gray-700 data-[selected=true]:text-gray-900"
          />
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-gray-50">
        
        {/* COLORS TAB */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2 text-xl">
              🎨 Colors
            </Typography>
            
            <div className="grid grid-cols-1 gap-6">
              {['primary-color', 'bg-color', 'text-color'].map((prop) => (
                <div key={prop} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <label className="text-sm font-semibold text-gray-900 capitalize block mb-2">
                    {prop.replace('-color', '').replace(/-/g, ' ')}
                  </label>
                  
                  <ChromePicker
                    color={cssProps[prop] || '#3b82f6'}
                    onChangeComplete={(color) => updateProp(prop, color.hex)}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {tailwindColors.map((color, i) => (
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
                  
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg w-fit">
                    {cssProps[prop] || '#3b82f6'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2 text-xl">
              📐 Layout & Spacing
            </Typography>
            
            <div className="grid grid-cols-1 gap-6">
              {[
                { key: 'padding', label: 'Padding', icon: '📏' },
                { key: 'margin', label: 'Margin', icon: '📐' },
                { key: 'gap', label: 'Gap', icon: '🔗' }
              ].map(({ key, label, icon }) => (
                <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    {icon} {label}
                  </label>
                  <Slider
                    value={parseFloat(cssProps[key]?.replace('rem', '') || 1) * 20}
                    onChange={(_, v) => updateProp(key, `${v / 20}rem`)}
                    min={0}
                    max={4}
                    step={0.05}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    {cssProps[key] || '1rem'}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <Typography variant="subtitle1" className="font-semibold mb-4 flex items-center gap-2 text-lg">
                ✨ Effects
              </Typography>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">Shadow</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'None', value: 'shadow-none' },
                      { label: 'Sm', value: 'shadow-sm' },
                      { label: 'Md', value: 'shadow-md' },
                      { label: 'Lg', value: 'shadow-lg' },
                      { label: 'Xl', value: 'shadow-xl' }
                    ].map(({ label, value }) => (
                      <Chip
                        key={value}
                        label={label}
                        variant={cssProps.shadow?.includes(value) ? 'filled' : 'outlined'}
                        onClick={() => updateProp('shadow', value)}
                        size="small"
                        className="cursor-pointer hover:shadow-md"
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">Border Radius</label>
                  <Slider
                    value={parseFloat(cssProps['border-radius']?.replace('rem', '') || 0.5) * 20}
                    onChange={(_, v) => updateProp('border-radius', `${v / 20}rem`)}
                    min={0}
                    max={2}
                    step={0.05}
                    marks
                    valueLabelDisplay="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TYPOGRAPHY TAB */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2 text-xl">
              🔤 Typography
            </Typography>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-3">Font Size</label>
                <Slider
                  value={parseFloat(cssProps['font-size']?.replace('rem', '') || 1) * 20}
                  onChange={(_, v) => updateProp('font-size', `${v / 20}rem`)}
                  min={0.5}
                  max={3}
                  step={0.05}
                  marks
                  valueLabelDisplay="auto"
                />
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {cssProps['font-size'] || '1rem'}
                </div>
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Chip 
                  label="Bold" 
                  variant={cssProps['font-weight'] === 'bold' ? 'filled' : 'outlined'}
                  color="primary"
                  onClick={() => updateProp('font-weight', 'bold')}
                />
                <Chip 
                  label="Normal" 
                  variant={cssProps['font-weight'] === 'normal' ? 'filled' : 'outlined'}
                  onClick={() => updateProp('font-weight', 'normal')}
                />
                <Chip 
                  label="Light" 
                  variant={cssProps['font-weight'] === 'light' ? 'filled' : 'outlined'}
                  onClick={() => updateProp('font-weight', 'light')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
