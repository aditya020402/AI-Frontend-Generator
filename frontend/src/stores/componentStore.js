import { create } from 'zustand';

export const useComponentStore = create((set, get) => ({
  currentComponent: null,
  conversations: [],
  cssProps: {},
  code: '',
  framework: 'react',
  
  setCurrentComponent: (component) => set({ 
    currentComponent: component,
    code: component?.current_code || '',
    cssProps: component?.css_props || {},
    framework: component?.framework || 'react',
    conversations: component?.conversations || []
  }),
  
  updateCode: (code) => set({ code }),
  updateCSSProps: (cssProps) => set({ cssProps }),
  addConversation: (message) => {
    const { conversations } = get();
    set({ conversations: [...conversations, message] });
  },
  setFramework: (framework) => set({ framework })
}));
