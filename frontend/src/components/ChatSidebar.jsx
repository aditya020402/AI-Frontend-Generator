import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, TextField, IconButton, Avatar, Typography, Paper,
  Chip, CircularProgress
} from '@mui/material';
import { Send, AttachFile, Code } from '@mui/icons-material';
import axios from 'axios';
import { useComponentStore } from '../stores/componentStore';

export default function ChatSidebar() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { 
    currentComponent, 
    conversations, 
    addConversation, 
    updateCode,
    setCurrentComponent
  } = useComponentStore();

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, scrollToBottom]);

  // 🔥 CREATE NEW COMPONENT - POST /generate ✅
  const handleGenerateNew = async () => {
    if (!message.trim() || sending) return;

    const userMessage = { 
      role: 'user', 
      message, 
      timestamp: new Date().toISOString()
    };

    addConversation(userMessage);
    const tempPrompt = message;
    setMessage('');
    setSending(true);

    try {
      // ✅ CORRECT FormData for /generate
      const formData = new FormData();
      formData.append('framework', 'react');
      formData.append('prompt', tempPrompt);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        formData,
        {
          timeout: 45000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // ✅ NO Content-Type - browser sets multipart boundary
          }
        }
      );

      const { id, code } = response.data;

      // Add AI response
      addConversation({
        role: 'assistant',
        message: '✅ New component created!',
        code,
        timestamp: new Date().toISOString()
      });

      // Update store
      setCurrentComponent({ 
        id, 
        current_code: code, 
        framework: 'react',
        name: 'New Component'
      });
      updateCode(code);

    } catch (error) {
      console.error('Generate error:', error);
      addConversation({
        role: 'assistant',
        message: `❌ Error: ${error.response?.data?.error || error.message || 'Failed to create component'}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  // 🔥 UPDATE COMPONENT - POST /:id/chat ✅
  const handleChatUpdate = async () => {
    if (!message.trim() || sending || !currentComponent?.id) return;

    const userMessage = { 
      role: 'user', 
      message, 
      timestamp: new Date().toISOString()
    };

    addConversation(userMessage);
    const tempMessage = message;
    setMessage('');
    setSending(true);

    try {
      // ✅ CORRECT FormData for /:id/chat
      const formData = new FormData();
      formData.append('message', tempMessage);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/${currentComponent.id}/chat`,
        formData,
        {
          timeout: 45000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // ✅ NO Content-Type - browser sets multipart boundary
          }
        }
      );

      const { code } = response.data;

      addConversation({
        role: 'assistant',
        message: '✅ Component updated!',
        code,
        timestamp: new Date().toISOString()
      });

      updateCode(code);
      setCurrentComponent(prev => ({ ...prev, current_code: code }));

    } catch (error) {
      console.error('Chat error:', error);
      addConversation({
        role: 'assistant',
        message: `❌ Error: ${error.response?.data?.error || error.message || 'Failed to update'}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  // 🔥 IMAGE UPLOAD - Both endpoints
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    if (currentComponent?.id) {
      formData.append('message', message || 'Update from image');
    } else {
      formData.append('framework', 'react');
      formData.append('prompt', message || 'Generate from screenshot');
    }

    setSending(true);
    addConversation({
      role: 'user',
      message: `📷 Uploading ${file.name}`,
      timestamp: new Date().toISOString()
    });

    try {
      let response;
      if (currentComponent?.id) {
        // Update existing
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat/${currentComponent.id}/chat`,
          formData,
          { 
            timeout: 60000,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        // New component
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/generate`,
          formData,
          { 
            timeout: 60000,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }

      const data = response.data;
      addConversation({
        role: 'assistant',
        message: currentComponent?.id ? '✅ Updated from image!' : '✅ Created from image!',
        code: data.code,
        timestamp: new Date().toISOString()
      });

      if (!currentComponent?.id && data.id) {
        setCurrentComponent({ 
          id: data.id, 
          current_code: data.code, 
          framework: 'react' 
        });
      }
      updateCode(data.code);

    } catch (error) {
      console.error('Image error:', error);
      addConversation({
        role: 'assistant',
        message: `❌ Image error: ${error.response?.data?.error || error.message}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  // 🔥 Main send handler
  const handleSend = () => {
    if (!currentComponent?.id) {
      handleGenerateNew();
    } else {
      handleChatUpdate();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-2xl border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Avatar sx={{ width: 48, height: 48 }} className="bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl">
            <Code className="w-6 h-6" />
          </Avatar>
          <div>
            <Typography variant="h6" className="font-bold text-gray-900">
              AI Component Builder
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              {currentComponent?.id ? (
                <Chip 
                  label={`Editing ${currentComponent.id.slice(-8)}`} 
                  size="small" 
                  className="bg-blue-100 text-blue-800 shadow-sm" 
                />
              ) : (
                <Chip label="Create New" color="primary" size="small" variant="outlined" />
              )}
              <Chip label="React + Tailwind" size="small" className="bg-emerald-100 text-emerald-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin bg-gradient-to-b from-gray-50 to-white">
        {conversations.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center space-y-6">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Code className="w-14 h-14 text-white" />
            </div>
            <div>
              <Typography variant="h5" className="font-bold text-gray-800 mb-2">
                Build with AI
              </Typography>
              <Typography variant="body1" className="text-gray-600 max-w-md mx-auto text-center">
                Describe your component or upload a screenshot. I'll generate perfect React + Tailwind code.
              </Typography>
            </div>
          </div>
        ) : (
          conversations.map((conv, index) => (
            <div key={conv.id || index} className={`animate-in slide-in-from-bottom-2 ${conv.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`flex ${conv.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl shadow-xl ${conv.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-16 border-4 border-blue-400/30' 
                  : 'bg-white/90 backdrop-blur-xl border border-gray-200/50 mr-16 shadow-2xl'
                }`}>
                  {conv.code ? (
                    <div className="bg-gradient-to-r from-slate-900 to-black p-5 rounded-2xl border border-slate-700/50 mb-4 overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-bold">Generated Code</span>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-900/50 p-4 rounded-xl">
                        {conv.code}
                      </pre>
                    </div>
                  ) : (
                    <Typography variant="body1" className="leading-relaxed whitespace-pre-wrap text-lg">
                      {conv.message}
                    </Typography>
                  )}
                  <div className="text-xs mt-4 flex justify-between items-center opacity-80">
                    <span>{new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {conv.error && <Chip label="Error" size="small" className="bg-red-100 text-red-800 !text-xs" />}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t-4 border-gray-200 bg-white/95 backdrop-blur-xl shrink-0 shadow-2xl">
        <Paper elevation={12} className="p-5 rounded-3xl border-2 border-gray-200/50 shadow-2xl hover:shadow-3xl transition-all">
          <div className="flex items-end gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={sending}
            />
            <IconButton 
              size="large"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all group"
            >
              <AttachFile className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            </IconButton>

            <TextField
              fullWidth
              placeholder={currentComponent?.id ? "Ask me to modify this component..." : "Describe your new component..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !sending && message.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              multiline
              maxRows={3}
              disabled={sending}
              className="flex-1 [&_.MuiOutlinedInput-root]:!rounded-3xl [&_.MuiOutlinedInput-root]:!border-2 [&_.MuiOutlinedInput-root]:border-blue-200 focus-within:[&_.MuiOutlinedInput-root]:border-blue-500 focus-within:[&_.MuiOutlinedInput-root]:ring-4 focus-within:[&_.MuiOutlinedInput-root]:ring-blue-100/60"
              variant="outlined"
              size="small"
            />

            <IconButton
              onClick={handleSend}
              disabled={!message.trim() || sending}
              size="large"
              className="p-4 !min-w-[56px] !h-[56px] shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              sx={{
                border: '3px solid',
                borderRadius: '24px',
                borderColor: !message.trim() || sending ? '#e5e7eb' : '#3b82f6',
                color: !message.trim() || sending ? '#9ca3af' : '#3b82f6',
                background: !message.trim() || sending ? '#f8fafc' : 'white',
                '&:hover': {
                  background: '#eff6ff !important',
                  borderColor: '#2563eb !important',
                  color: '#1e40af !important',
                  transform: 'scale(1.1) !important'
                }
              }}
            >
              {sending ? <CircularProgress size={24} /> : <Send />}
            </IconButton>
          </div>

          {!currentComponent?.id && (
            <Typography variant="caption" className="block text-center mt-4 text-gray-600 italic bg-blue-50 p-3 rounded-2xl border-2 border-dashed border-blue-200">
              ✨ Your first message will create a new component
            </Typography>
          )}
        </Paper>
      </div>
    </div>
  );
}
