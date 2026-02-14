import React, { useState } from 'react';
import {
  Slider, Box, Typography, Chip, Tabs, Tab,
  FormControlLabel, Switch, Divider
} from '@mui/material';
// ✅ FIXED ICONS - These ALL EXIST
import { Palette, GridView, Typography as TypographyIcon } from '@mui/icons-material';
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
          className="bg-gray-50 rounded-xl"
        >
          <Tab 
            icon={<Palette />} 
            label="Colors"
            className="min-h-12 font-medium data-[highlighted=true]:bg-blue-50 data-[selected=true]:bg-blue-50 text-gray-700 data-[selected=true]:text-blue-600"
          />
          <Tab 
            icon={<GridView />} 
            label="Layout"
            className="min-h-12 font-medium data-[highlighted=true]:bg-gray-50 data-[selected=true]:bg-gray-50 text-gray-700 data-[selected=true]:text-gray-900"
          />
          <Tab 
            icon={<TypographyIcon />} 
            label="Typography"
            className="min-h-12 font-medium data-[highlighted=true]:bg-gray-50 data-[selected=true]:bg-gray-50 text-gray-700 data-[selected=true]:text-gray-900"
          />
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        
        {/* COLORS TAB */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2">
              🎨 Colors
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['primary-color', 'bg-color', 'text-color'].map((prop) => (
                <div key={prop} className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 capitalize block mb-3">
                    {prop.replace('-color', '').replace(/-/g, ' ')}
                  </label>
                  
                  {/* Color Picker */}
                  <ChromePicker
                    color={cssProps[prop] || '#3b82f6'}
                    onChangeComplete={(color) => updateProp(prop, color.hex)}
                    className="shadow-lg rounded-xl overflow-hidden"
                  />
                  
                  {/* Quick Colors */}
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl">
                    {tailwindColors.map((color, i) => (
                      <button
                        key={i}
                        style={{ backgroundColor: color }}
                        className="w-10 h-10 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-white"
                        onClick={() => updateProp(prop, color)}
                      />
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
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
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2">
              📐 Layout & Spacing
            </Typography>
            
            <div className="space-y-6">
              {[
                { key: 'padding', label: 'Padding', icon: '📏' },
                { key: 'margin', label: 'Margin', icon: '📐' },
                { key: 'gap', label: 'Gap', icon: '🔗' }
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
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
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {cssProps[key] || '1rem'}
                  </div>
                </div>
              ))}
            </div>

            {/* Shadows & Effects */}
            <Divider className="my-6" />
            <div>
              <Typography variant="subtitle1" className="font-semibold mb-4 flex items-center gap-2">
                ✨ Effects
              </Typography>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Shadow</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'None', value: 'none' },
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
                        className="cursor-pointer hover:shadow-md transition-all"
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Radius</label>
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
            <Typography variant="h6" className="font-bold text-gray-900 flex items-center gap-2">
              🔤 Typography
            </Typography>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">Font Size</label>
                <Slider
                  value={parseFloat(cssProps['font-size']?.replace('rem', '') || 1) * 20}
                  onChange={(_, v) => updateProp('font-size', `${v / 20}rem`)}
                  min={0.5}
                  max={3}
                  step={0.05}
                  marks
                  valueLabelDisplay="auto"
                />
              </div>
              
              <div className="flex gap-3">
                <Chip 
                  label="Bold" 
                  variant={cssProps['font-weight'] === 'bold' ? 'filled' : 'outlined'}
                  onClick={() => updateProp('font-weight', 'bold')}
                  color="primary"
                />
                <Chip 
                  label="Normal" 
                  variant={cssProps['font-weight'] === 'normal' ? 'filled' : 'outlined'}
                  onClick={() => updateProp('font-weight', 'normal')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
