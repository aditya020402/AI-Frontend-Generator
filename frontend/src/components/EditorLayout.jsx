export default function EditorLayout({ componentId }) {
  const { framework, setFramework } = useComponentStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* ✅ FIXED HEADER */}
      <AppBar position="fixed" elevation={0} className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-[1000] top-0">
        {/* Header content from above */}
      </AppBar>

      {/* ✅ FIXED MAIN CONTENT - pt-[70px] OFFSET */}
      <div className="flex-1 overflow-hidden pt-[70px]"> {/* Header height offset */}
        <div className="h-full flex">
          {/* Chat Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0">
            <ChatSidebar />
          </div>
          
          {/* Editor + Preview */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-[50%] border-r border-gray-200 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💻</span>
                  <Typography variant="subtitle1" className="font-semibold">
                    Code Editor
                  </Typography>
                </div>
              </div>
              <div className="flex-1">
                <Editor />
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50">
              <LivePreview />
            </div>
          </div>
        </div>
      </div>
      
      {/* ✅ Bottom Property Panel */}
      <div className="h-72 border-t-2 border-gray-200 bg-white shadow-2xl z-50">
        <PropertyPanel />
      </div>
    </div>
  );
}
