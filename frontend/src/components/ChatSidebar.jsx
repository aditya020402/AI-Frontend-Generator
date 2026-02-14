import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, TextField, IconButton, Avatar, Typography, Paper,
  Divider, Chip, Fab, CircularProgress
} from '@mui/material';
import { Send, AttachFile, Code } from '@mui/icons-material';
import axios from 'axios';
import { useComponentStore } from '../stores/componentStore';

export default function ChatSidebar() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textFieldRef = useRef(null);
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

  // 🔥 NEW COMPONENT - POST /generate
  const handleNewComponent = async () => {
    if (!message.trim() || sending) return;

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
      // 🔥 YOUR /generate endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        new FormData().append('prompt', tempMessage),
        new FormData().append('framework', 'react'),
        {
          timeout: 45000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const { id, code } = response.data;

      // Add AI response
      addConversation({
        role: 'assistant',
        message: '✅ New component created!',
        code,
        componentId: id,
        timestamp: new Date().toISOString()
      });

      // Update store with new component
      setCurrentComponent({ id, current_code: code, framework: 'react' });
      updateCode(code);

    } catch (error) {
      addConversation({
        role: 'assistant',
        message: `Error: ${error.response?.data?.error || 'Failed to create component'}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  // 🔥 UPDATE COMPONENT - POST /:id/chat  
  const handleUpdateComponent = async () => {
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
      // 🔥 YOUR /:id/chat endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/${currentComponent.id}/chat`,
        { message: tempMessage },
        {
          timeout: 45000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { code } = response.data;

      // Add AI response
      addConversation({
        role: 'assistant',
        message: '✅ Component updated!',
        code,
        timestamp: new Date().toISOString()
      });

      // Update editor + preview
      updateCode(code);
      
      // Update current component in store
      setCurrentComponent(prev => ({
        ...prev,
        current_code: code
      }));

    } catch (error) {
      addConversation({
        role: 'assistant',
        message: `Error: ${error.response?.data?.error || 'Failed to update component'}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  // 🔥 Send message - New vs Update logic
  const handleSend = () => {
    if (!currentComponent?.id) {
      handleNewComponent();  // No component → create new
    } else {
      handleUpdateComponent();  // Has component → update
    }
  };

  // 🔥 Image upload - handled by backend multer
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', message || 'Generate component from this screenshot');
    formData.append('framework', currentComponent?.framework || 'react');

    setSending(true);
    addConversation({
      role: 'user',
      message: `📷 Uploading ${file.name}`,
      timestamp: new Date().toISOString()
    });

    try {
      let response;
      
      if (!currentComponent?.id) {
        // New component with image
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/generate`,
          formData,
          {
            timeout: 60000,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
              // No Content-Type - let browser set multipart boundary
            }
          }
        );
      } else {
        // Update existing with image
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat/${currentComponent.id}/chat`,
          formData,
          {
            timeout: 60000,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }

      const { id, code } = response.data;

      addConversation({
        role: 'assistant',
        message: '✅ Generated from image!',
        code,
        timestamp: new Date().toISOString()
      });

      if (!currentComponent?.id && id) {
        setCurrentComponent({ id, current_code: code, framework: 'react' });
      }
      updateCode(code);

    } catch (error) {
      addConversation({
        role: 'assistant',
        message: `Image error: ${error.response?.data?.error || 'Upload failed'}`,
        error: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Avatar sx={{ width: 42, height: 42 }} className="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border-2 border-white">
            <Code className="w-5 h-5" />
          </Avatar>
          <div>
            <Typography variant="subtitle1" className="font-bold text-gray-900 text-lg">
              AI Component Builder
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <Chip 
                label={currentComponent?.id ? `Editing ${currentComponent.id.slice(-8)}` : 'Create new'} 
                size="small" 
                className="bg-blue-100 text-blue-800 text-xs shadow-sm" 
              />
              {currentComponent?.framework && (
                <Chip label={currentComponent.framework.toUpperCase()} size="small" className="bg-gray-100 text-gray-800 text-xs" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gradient-to-b from-gray-50/80 to-white/50 backdrop-blur-sm">
        {conversations.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Code className="w-12 h-12 text-white" />
            </div>
            <Typography variant="h5" className="font-bold text-gray-800">
              Build components with AI
            </Typography>
            <Typography variant="body1" className="text-gray-600 max-w-sm mx-auto text-center">
              Describe what you want or upload a screenshot. I'll generate React + Tailwind code.
            </Typography>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id || conv.timestamp} className={`animate-in slide-in-from-bottom-2 duration-200 ${conv.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`flex ${conv.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${conv.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-12 border' 
                  : 'bg-white/90 backdrop-blur-sm border border-gray-200/50 mr-12 shadow-xl'
                }`}>
                  {conv.image && (
                    <img src={conv.image} alt="Screenshot" className="w-full max-h-64 object-contain rounded-xl mb-4 shadow-lg" />
                  )}
                  {conv.code ? (
                    <div className="bg-gradient-to-r from-gray-900 to-black/80 p-4 rounded-xl border border-gray-700/50">
                      <pre className="text-xs font-mono whitespace-pre-wrap leading-6 overflow-x-auto">
                        {conv.code}
                      </pre>
                    </div>
                  ) : (
                    <Typography variant="body2" className="leading-relaxed whitespace-pre-wrap text-lg">
                      {conv.message}
                    </Typography>
                  )}
                  <div className="text-xs mt-3 flex justify-between items-center opacity-80">
                    <span>
                      {new Date(conv.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {conv.error && <Chip label="Error" size="small" className="bg-red-100 text-red-800" />}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md shrink-0 shadow-2xl">
        <Paper elevation={8} className="p-4 rounded-3xl border border-gray-200/50 shadow-2xl hover:shadow-3xl transition-all">
          <div className="flex items-end gap-3">
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
              className="p-3 hover:bg-blue-50 hover:shadow-md transition-all border-2 border-dashed border-blue-200 hover:border-blue-400"
            >
              <AttachFile className="w-5 h-5 text-blue-600" />
            </IconButton>

            <TextField
              inputRef={textFieldRef}
              fullWidth
              placeholder={currentComponent?.id ? "Ask me to modify this component..." : "Describe your component..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !sending) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              multiline
              maxRows={3}
              disabled={sending}
              className="flex-1 [&_.MuiOutlinedInput-root]:rounded-2xl [&_.MuiOutlinedInput-root]:border-2 [&_.MuiOutlinedInput-root]:border-blue-200 focus-within:[&_.MuiOutlinedInput-root]:border-blue-500 focus-within:[&_.MuiOutlinedInput-root]:ring-4 focus-within:[&_.MuiOutlinedInput-root]:ring-blue-100/70"
              variant="outlined"
              size="small"
            />

            <IconButton
              onClick={handleSend}
              disabled={!message.trim() || sending}
              size="large"
              className="p-4 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              sx={{
                border: '3px solid',
                borderRadius: '20px',
                minWidth: '52px',
                height: '52px',
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
              {sending ? <CircularProgress size={22} /> : <Send />}
            </IconButton>
          </div>
          
          {!currentComponent?.id && (
            <Typography variant="caption" className="block text-center mt-3 text-gray-500 italic bg-yellow-50 p-2 rounded-xl">
              💡 First message creates new component
            </Typography>
          )}
        </Paper>
      </div>
    </div>
  );
}
