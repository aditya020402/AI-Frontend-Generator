import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, IconButton, Avatar, Typography, Paper,
  Divider, Chip, Fab
} from '@mui/material';
import { Send, AttachFile, Code } from '@mui/icons-material';
import { useComponentStore } from '../stores/componentStore';

export default function ChatSidebar() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { conversations, addConversation } = useComponentStore();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMsg = { role: 'user', message, timestamp: new Date() };
    addConversation(userMsg);
    setSending(true);
    setMessage('');

    // Simulate AI response (replace with real API)
    setTimeout(() => {
      addConversation({ 
        role: 'assistant', 
        message: '```jsx\nfunction UpdatedComponent() {\n  // Tailwind code generated\n}\n```',
        timestamp: new Date()
      });
      setSending(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <Avatar sx={{ width: 32, height: 32 }} className="bg-primary-600">
            <Code fontSize="small" className="text-white" />
          </Avatar>
          <div>
            <Typography variant="subtitle2" className="font-semibold text-gray-900">
              AI Component Assistant
            </Typography>
            <Chip label="Online" size="small" className="bg-green-100 text-green-800 mt-1" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {conversations.map((conv, index) => (
          <div key={index} className={`animate-fade-in ${conv.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex ${conv.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 max-w-[85%]`}>
              <Avatar 
                sx={{ width: 32, height: 32 }} 
                className={conv.role === 'user' ? 'bg-primary-600 order-2' : 'bg-gray-300 order-1'}
              >
                {conv.role === 'user' ? 'U' : 'AI'}
              </Avatar>
              <div className={`p-4 rounded-2xl shadow-sm ${conv.role === 'user' 
                ? 'chat-bubble-user' 
                : 'chat-bubble-ai max-w-[85%]'}`}>
                {conv.message.includes('```') ? (
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-900/90 text-white p-4 rounded-xl overflow-x-auto">
                    {conv.message}
                  </pre>
                ) : (
                  <Typography variant="body2" className="leading-relaxed">
                    {conv.message}
                  </Typography>
                )}
                <div className="text-xs mt-2 opacity-75">
                  {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <Paper elevation={2} className="p-3 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-end gap-3">
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-gray-100 p-2"
            >
              <AttachFile fontSize="small" />
            </IconButton>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden"
              accept="image/*"
            />
            
            <TextField
              fullWidth
              placeholder="Ask AI to modify your component... (dark theme, add shadows, etc)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              multiline
              maxRows={3}
              disabled={sending}
              className="resize-none"
              variant="outlined"
              size="small"
            />
            
            <IconButton
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className={`${sending ? 'bg-primary-100 text-primary-600' : 'text-primary-600 hover:bg-primary-50'}`}
              size="large"
            >
              {sending ? (
                <CircularProgress size={20} />
              ) : (
                <Send />
              )}
            </IconButton>
          </div>
        </Paper>
      </div>
    </div>
  );
}
