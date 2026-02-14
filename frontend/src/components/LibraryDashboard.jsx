import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, CardMedia, Typography,
  Button, TextField, Chip, Box, AppBar, Toolbar, IconButton,
  Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeIcon from '@mui/icons-material/Code';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Editor as EditorIcon } from '@mui/icons-material';

export default function LibraryDashboard() {
  const [components, setComponents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFramework, setFilterFramework] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/components`);
      setComponents(data);
    } catch (error) {
      console.error('Failed to fetch components:', error);
    }
  };

  const filteredComponents = components.filter(comp => 
    (comp.name.toLowerCase().includes(search.toLowerCase()) || 
     comp.base_prompt?.toLowerCase().includes(search.toLowerCase())) &&
    (filterFramework === 'all' || comp.framework === filterFramework)
  );

  const frameworkChips = [
    { label: 'All', value: 'all' },
    { label: 'React', value: 'react' },
    { label: 'HTML/CSS/JS', value: 'html-css-js' }
  ];

  const handleNewComponent = () => {
    navigate('/editor/new');
  };

  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Component Library
          </Typography>
          <Button color="inherit" onClick={handleNewComponent}>
            + New Component
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {frameworkChips.map(chip => (
            <Chip
              key={chip.value}
              label={chip.label}
              variant={filterFramework === chip.value ? 'filled' : 'outlined'}
              onClick={() => setFilterFramework(chip.value)}
              clickable
            />
          ))}
        </Box>

        <TextField
          fullWidth
          label="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {filteredComponents.map((component) => (
            <Grid item xs={12} sm={6} md={4} key={component.id}>
              <Card 
                sx={{ height: '100%', cursor: 'pointer' }}
                onClick={() => handleEdit(component.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={component.preview_image || '/placeholder-preview.png'}
                  alt={component.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {component.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CodeIcon fontSize="small" color="primary" />
                    <Chip label={component.framework.toUpperCase()} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      icon={<ChatBubbleIcon fontSize="small" />} 
                      label={`${component.message_count || 0} messages`} 
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(component.last_activity).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredComponents.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 8, py: 4 }}>
            <EditorIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No components found
            </Typography>
            <Button variant="contained" onClick={handleNewComponent} size="large">
              Create Your First Component
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}
