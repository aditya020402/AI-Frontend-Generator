import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

const useComponentStore = create(
  devtools((set, get) => ({
    // State
    components: [],
    currentComponent: null,
    conversations: [],
    framework: 'react',
    
    // 🔥 FETCH COMPONENTS - GET /
    fetchComponents: async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/components`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        set({ components: response.data });
      } catch (error) {
        console.error('Failed to fetch components:', error);
      }
    },

    // 🔥 CREATE NEW COMPONENT - POST /
    createComponent: async (name = 'New Component') => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/components`,
          { name, framework: get().framework },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const newComponent = {
          id: response.data.id,
          name,
          framework: get().framework,
          current_code: get().framework === 'react' 
            ? `function ${name.replace(/\s+/g, '')}() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-xl max-w-md mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hello World!</h2>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
        Click Me
      </button>
    </div>
  );
}

export default ${name.replace(/\s+/g, '')};`
            : `<!DOCTYPE html>
<html>
<head>
  <style>
    .container { 
      padding: 2rem; 
      background: white; 
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      max-width: 400px;
      margin: 1rem auto;
      border: 1px solid #e5e7eb;
    }
    button {
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #111827;">Hello World!</h2>
    <button>Click Me</button>
  </div>
</body>
</html>`,
          css_props: {}
        };
        
        set(state => ({
          components: [newComponent, ...state.components],
          currentComponent: newComponent
        }));
        
        return newComponent;
      } catch (error) {
        console.error('Failed to create component:', error);
        throw error;
      }
    },

    // 🔥 SET CURRENT COMPONENT - Matches GET /:id response
    setCurrentComponent: (component) => {
      set({ 
        currentComponent: component,
        conversations: component?.conversations || []
      });
    },

    // 🔥 UPDATE CODE - PUT /:id
    updateCode: async (code) => {
      const currentComponent = get().currentComponent;
      if (!currentComponent?.id) return;

      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/components/${currentComponent.id}`,
          { current_code: code },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        set({
          currentComponent: {
            ...currentComponent,
            current_code: code,
            updated_at: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to update code:', error);
      }
    },

    // 🔥 ADD CONVERSATION MESSAGE (optimistic UI)
    addConversation: (message) => {
      set(state => ({
        conversations: [...state.conversations, message]
      }));
    },

    // 🔥 CLEAR CONVERSATIONS
    clearConversations: () => set({ conversations: [] }),

    // 🔥 SET FRAMEWORK
    setFramework: (framework) => {
      set({ framework });
      
      // Update current component if exists
      const current = get().currentComponent;
      if (current) {
        set({
          currentComponent: { ...current, framework }
        });
      }
    },

    // 🔥 DELETE COMPONENT
    deleteComponent: async (id) => {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/components/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        set(state => ({
          components: state.components.filter(c => c.id !== id),
          currentComponent: state.currentComponent?.id === id ? null : state.currentComponent
        }));
      } catch (error) {
        console.error('Failed to delete component:', error);
      }
    },

    // 🔥 SELECT COMPONENT
    selectComponent: (id) => {
      const component = get().components.find(c => c.id === id);
      if (component) {
        set({ 
          currentComponent: component,
          conversations: component.conversations || []
        });
      }
    }
  }))
);

export { useComponentStore };
