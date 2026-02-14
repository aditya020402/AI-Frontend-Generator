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
  const [currentComponentId, setCurrentComponentId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Zustand store connection
  const { 
    currentComponent, 
    conversations, 
    addConversation, 
    updateCode, 
    setCurrentComponent,
    sendChatMessage 
  } = useComponentStore();

  // Update component ID when it changes
  useEffect(() => {
    setCurrentComponentId(currentComponent?.id || null);
  }, [currentComponent?.id]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, scrollToBottom]);

  // 🚀 REAL BACKEND API CALL - Generate/Update Component Code
  const handleSend = async () => {
    if (!message.trim() || !currentComponentId || sending) return;

    const userMessage = { 
      role: 'user', 
      message, 
      timestamp: new Date(),
      id: `msg-${Date.now()}`
    };

    // Add user message to UI immediately
    addConversation(userMessage);
    setMessage('');
    setSending(true);

    try {
      // 🔥 ACTUAL BACKEND CALL - POST to /chat/{component_id}
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/${currentComponentId}/messages`,
        {
          message: userMessage.message,
          conversation_id: conversations.length + 1, // Or use actual ID
          current_code: currentComponent?.current_code || ''
        },
        {
          timeout: 30000, // 30s timeout for AI generation
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const aiResponse = response.data;

      // Update conversations with AI response
      const assistantMessage = {
        role: 'assistant',
        message: aiResponse.message || `Generated code:\n\`\`\`${aiResponse.code}\`\`\``,
        code: aiResponse.code,
        timestamp: new Date(),
        id: `ai-${Date.now()}`
      };

      addConversation(assistantMessage);

      // 🔥 UPDATE CODE IN EDITOR & PREVIEW
      if (aiResponse.code) {
        updateCode(aiResponse.code);
        
        // Auto-save updated code to backend
        await axios.put(
          `${import.meta.env.VITE_API_URL}/components/${currentComponentId}`,
          {
            current_code: aiResponse.code,
            css_props: currentComponent?.css_props || {},
            updated_at: new Date().toISOString()
          }
        );
      }

    } catch (error) {
      console.error('Chat API error:', error);
      
      // Add error message to conversation
      addConversation({
        role: 'assistant',
        message: 'Sorry, I encountered an error generating code. Please try again or check the console.',
        error: true,
        timestamp: new Date(),
        id: `error-${Date.now()}`
      });
    } finally {
      setSending(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentComponentId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result; // base64

      // Add image upload message
      addConversation({
        role: 'user',
        message: `Uploaded image: ${file.name}`,
        image: imageData,
        timestamp: new Date()
      });

      setSending(true);
      
      try {
        // Send image to backend for vision analysis
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat/${currentComponentId}/vision`,
          {
            image_data: imageData,
            message: 'Analyze this UI screenshot and generate matching Tailwind code'
          }
        );

        const visionResponse = response.data;
        addConversation({
          role: 'assistant',
          message: visionResponse.message || 'Generated code from image:',
          code: visionResponse.code,
          timestamp: new Date()
        });

        if (visionResponse.code) {
          updateCode(visionResponse.code);
        }

      } catch (error) {
        console.error('Vision API error:', error);
        addConversation({
          role: 'assistant',
          message: 'Sorry, couldn\'t analyze the image. Please try text description.',
          error: true
        });
      } finally {
        setSending(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Avatar sx={{ width: 32, height: 32 }} className="bg-blue-600">
            <Code fontSize="small" className="text-white" />
          </Avatar>
          <div>
            <Typography variant="subtitle2" className="font-semibold text-gray-900">
              AI Component Assistant
            </Typography>
            <Chip 
              label={currentComponentId ? `Component #${currentComponentId.slice(-6)}` : 'New'} 
              size="small" 
              className="mt-1 bg-blue-100 text-blue-800 text-xs" 
            />
          </div>
        </div>
        {currentComponentId && (
          <Typography variant="caption" className="text-gray-500 block">
            Editing: {currentComponent?.name || 'Untitled'}
          </Typography>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <Typography variant="h6" className="mb-2">No conversations yet</Typography>
            <Typography variant="body2">Ask me to generate or modify your component</Typography>
            <div className="mt-4 text-xs space-y-1">
              <div className="flex items-center gap-2 text-blue-600">
                <Send fontSize="small" /> "Make this button smaller"
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <AttachFile fontSize="small" /> Upload screenshot
              </div>
            </div>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className={`animate-fade-in ${conv.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`flex ${conv.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 max-w-[85%]`}>
                <Avatar 
                  sx={{ width: 32, height: 32 }} 
                  className={conv.role === 'user' ? 'bg-blue-600 order-2' : 'bg-gray-300 order-1'}
                >
                  {conv.role === 'user' ? 'U' : 'AI'}
                </Avatar>
                <div className={`p-4 rounded-2xl shadow-sm max-w-full ${conv.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'}`}>
                  {conv.image && (
                    <img src={conv.image} alt="Uploaded" className="max-w-full h-48 object-contain rounded-lg mb-3" />
                  )}
                  {conv.code ? (
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                      {conv.code}
                    </pre>
                  ) : (
                    <Typography variant="body2" className="leading-relaxed">
                      {conv.message}
                    </Typography>
                  )}
                  <div className="text-xs mt-2 opacity-75 text-right">
                    {new Date(conv.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  {conv.error && (
                    <Chip label="Error" size="small" className="mt-2 bg-red-100 text-red-800 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <Paper elevation={2} className="p-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-end gap-3">
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="hover:bg-gray-100 p-2 text-gray-500"
            >
              <AttachFile fontSize="small" />
            </IconButton>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={sending}
            />
            
            <TextField
              fullWidth
              placeholder={currentComponentId ? "Ask AI to modify your component..." : "Create your first component..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              multiline
              maxRows={3}
              disabled={sending || !currentComponentId}
              className="resize-none [&>div>div>div]:py-2"
              variant="outlined"
              size="small"
            />
            
            <IconButton
              onClick={handleSend}
              disabled={!message.trim() || sending || !currentComponentId}
              className={`p-2 ${sending 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-blue-600 hover:bg-blue-50'
              }`}
              size="large"
            >
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <Send />
              )}
            </IconButton>
          </div>
          
          {!currentComponentId && (
            <Typography variant="caption" className="text-gray-500 block text-center mt-2">
              Create or open a component first
            </Typography>
          )}
        </Paper>
      </div>
    </div>
  );
}
