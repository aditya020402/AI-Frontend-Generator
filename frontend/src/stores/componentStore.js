import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

export const useComponentStore = create(
  devtools((set, get) => ({
    // State
    currentComponent: null,
    conversations: [],
    cssProps: {
      'primary-color': '#3b82f6',
      'bg-color': '#ffffff',
      'text-color': '#1f2937',
      padding: '1rem',
      margin: '1rem',
      'border-radius': '0.5rem',
      shadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    code: '',
    framework: 'react',
    loading: false,

    // Actions
    setCurrentComponent: async (componentId) => {
      if (!componentId || componentId === 'new') {
        set({ 
          currentComponent: null, 
          code: '', 
          conversations: [],
          cssProps: get().cssProps 
        });
        return;
      }

      set({ loading: true });
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/components/${componentId}`
        );
        set({ 
          currentComponent: data,
          code: data.current_code || '',
          conversations: data.conversations || [],
          cssProps: data.css_props || get().cssProps,
          framework: data.framework || 'react'
        });
      } catch (error) {
        console.error('Failed to load component:', error);
      } finally {
        set({ loading: false });
      }
    },

    updateCode: (code) => set({ code }),
    
    updateCSSProps: (cssProps) => {
      set({ cssProps });
      // Auto-save CSS props
      if (get().currentComponent?.id) {
        axios.put(`${import.meta.env.VITE_API_URL}/components/${get().currentComponent.id}`, {
          css_props: cssProps
        }).catch(console.error);
      }
    },

    addConversation: (message) => {
      const conversations = get().conversations;
      set({ 
        conversations: [...conversations, { 
          ...message, 
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        }]
      });
    },

    sendChatMessage: async (message, image = null) => {
      const { currentComponent } = get();
      if (!currentComponent?.id) return;

      get().addConversation({ role: 'user', message });
      
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat/${currentComponent.id}/chat`,
          { message, image }
        );
        get().updateCode(data.code);
        get().addConversation({ role: 'assistant', message: data.code });
      } catch (error) {
        console.error('Chat error:', error);
      }
    },

    setFramework: (framework) => set({ framework }),

    saveComponent: async (name) => {
      const { currentComponent, code, cssProps } = get();
      if (!currentComponent?.id) return;

      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/components/${currentComponent.id}`, {
          current_code: code,
          css_props: cssProps,
          name
        });
      } catch (error) {
        console.error('Save failed:', error);
      }
    },

    createNewComponent: async (framework = 'react', name = 'New Component') => {
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/components`, {
          framework,
          name
        });
        await get().setCurrentComponent(data.id);
        return data.id;
      } catch (error) {
        console.error('Create failed:', error);
      }
    }
  }))
);
