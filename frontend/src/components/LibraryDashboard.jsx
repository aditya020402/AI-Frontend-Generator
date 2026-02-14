import React, { useState, useEffect, useTransition } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Button, TextField, Chip, Box, AppBar, Toolbar,
  InputAdornment, CircularProgress, Fade
} from '@mui/material';
import { Search, Code, ChatBubble } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LibraryDashboard() {
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFramework, setFilterFramework] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/components`);
      setComponents(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter(comp => 
    comp.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterFramework === 'all' || comp.framework === filterFramework)
  );

  const handleNewComponent = () => navigate('/editor/new');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppBar 
          position="fixed" 
          elevation={0}   
          className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-[1000] top-0" 
          sx={{ height: 70 }} 
        >
        <Toolbar className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-1 flex items-center space-x-4">
            <Code className="text-2xl text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Component Library</h1>
              <p className="text-sm text-gray-500">Your AI-generated Tailwind components</p>
            </div>
          </div>
          <Button 
            className="btn-primary !text-sm font-semibold"
            onClick={handleNewComponent}
            startIcon={<span className="text-lg">✨</span>}
          >
            New Component
          </Button>
        </Toolbar>
      </AppBar>

      {/* Filters & Search */}
      <Container maxWidth="7xl" className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1">
              <TextField
                fullWidth
                placeholder="Search components by name or prompt..."
                value={search}
                onChange={(e) => {
                  startTransition(() => setSearch(e.target.value));
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-gray-400" />
                    </InputAdornment>
                  )
                }}
                className="shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'react', 'html-css-js'].map((fw) => (
                <Chip
                  key={fw}
                  label={fw === 'all' ? 'All' : fw.toUpperCase()}
                  variant={filterFramework === fw ? 'filled' : 'outlined'}
                  onClick={() => setFilterFramework(fw)}
                  className={filterFramework === fw 
                    ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-glow' 
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                  }
                  clickable
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress size={48} className="text-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredComponents.map((component, index) => (
              <Fade in key={component.id} timeout={index * 50}>
                <div>
                  <Card 
                    className="card h-full group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                    onClick={() => navigate(`/editor/${component.id}`)}
                  >
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-primary-50 group-hover:to-blue-50 transition-all duration-500">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-gray-200 group-hover:border-primary-400 transition-colors">
                        <Code className="text-gray-500 w-6 h-6 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </div>
                    <CardContent className="p-6 pt-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Chip 
                          label={component.framework.toUpperCase()} 
                          size="small" 
                          className="bg-primary-100 text-primary-800 font-medium"
                        />
                        {component.status === 'draft' && (
                          <Chip label="Draft" size="small" className="bg-gray-100 text-gray-700" />
                        )}
                      </div>
                      <Typography variant="h6" className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {component.name}
                      </Typography>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <ChatBubble fontSize="small" />
                          <span>{component.message_count || 0} messages</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(component.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Fade>
            ))}
          </div>
        )}

        {filteredComponents.length === 0 && !loading && (
          <div className="text-center py-24 px-8">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-3xl flex items-center justify-center shadow-lg">
              <Code className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No components yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Create your first AI-powered Tailwind component and watch the magic happen.
            </p>
            <Button className="btn-primary text-lg px-8 py-4 font-semibold" onClick={handleNewComponent}>
              <span className="text-lg mr-2">✨</span>
              Create First Component
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
