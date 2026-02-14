import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

const useComponentStore = create(
  devtools((set, get) => ({
    // ✅ DEFAULT STATE - No infinite loader!
    components: [],
    currentComponent: {
      id: 'welcome',
      name: 'Welcome Component',
      framework: 'react',
      current_code: `function Welcome() {
  return (
    <div className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 max-w-lg mx-auto text-center">
      <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-8 drop-shadow-lg">
        AI Component Builder ✨
      </h1>
      <div className="space-y-6 mb-12">
        <p className="text-xl text-gray-700 leading-relaxed max-w-md mx-auto">
          Chat on the left → Code appears here → Live preview on right
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">AI Chat</h3>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Code Editor</h3>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Live Preview</h3>
          </div>
        </div>
      </div>
      <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
        🚀 Start Building
      </button>
    </div>
  );
}

export default Welcome;`,
      css_props: {}
    },
    conversations: [],
    framework: 'react',
    
    // ✅ SELECTOR - For Editor component
    code: (state) => state.currentComponent?.current_code || '',
    
    // 🔥 FETCH COMPONENTS
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

    // 🔥 CREATE COMPONENT
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
            ? `function ${name.replace(/\\s+/g, '')}() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-xl max-w-md mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hello ${name}!</h2>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
        Click Me
      </button>
    </div>
  );
}

export default ${name.replace(/\\s+/g, '')};`
            : `<!DOCTYPE html>
<html><head><style>.container{padding:2rem;background:white;border-radius:.75rem;box-shadow:0 20px 25px -5px rgba(0,0,0,.1);max-width:400px;margin:1rem auto;border:1px solid #e5e7eb;}button{background:#3b82f6;color:white;padding:12px 24px;border:none;border-radius:.75rem;font-weight:600;cursor:pointer;transition:all .3s;}button:hover{background:#2563eb;}</style></head><body><div class="container"><h2 style="font-size:1.5rem;font-weight:bold;margin-bottom:1.5rem;color:#111827;">Hello ${name}!</h2><button>Click Me</button></div></body></html>`,
          css_props: {}
        };
        
        set(state => ({
          components: [newComponent, ...state.components],
          currentComponent: newComponent  // ✅ Updates editor + preview
        }));
        
        return newComponent;
      } catch (error) {
        console.error('Failed to create component:', error);
        throw error;
      }
    },

    // ✅ FIXED - Updates EVERYWHERE (editor, preview, backend)
    setCurrentComponent: (component) => {
      set({ 
        currentComponent: component,
        conversations: component?.conversations || []
      });
    },

    // ✅ FIXED - Updates code in currentComponent
    updateCode: async (code) => {
      const currentComponent = get().currentComponent;
      if (!currentComponent?.id || currentComponent.id === 'welcome') return;

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

    addConversation: (message) => {
      set(state => ({
        conversations: [...state.conversations, { ...message, id: Date.now().toString() }]
      }));
    },

    clearConversations: () => set({ conversations: [] }),

    setFramework: (framework) => {
      set({ framework });
      const current = get().currentComponent;
      if (current) {
        set({
          currentComponent: { ...current, framework }
        });
      }
    },

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
        console.error('Failed to delete:', error);
      }
    },

    selectComponent: (id) => {
      const component = get().components.find(c => c.id === id);
      if (component) {
        set({ 
          currentComponent: component,
          conversations: component.conversations || []
        });
      }
    }
  }), {
    name: 'component-store'
  })
);

export { useComponentStore };
