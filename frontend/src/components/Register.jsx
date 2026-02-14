import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Container, TextField, Button, Typography,
  Box, Alert, IconButton, InputAdornment, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        formData,
        { timeout: 10000 }
      );

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      login({ token, ...user });
      
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <Container maxWidth="sm">
        <Box className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-md mx-auto w-full">
          <Typography 
            variant="h3" 
            className="font-bold text-gray-900 text-center mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
          >
            Create Account
          </Typography>
          <Typography className="text-gray-600 text-center mb-8">
            Join AI Component Builder today
          </Typography>
          
          {error && <Alert severity="error" className="mb-6 rounded-2xl">{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mb-4"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mb-4"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mb-6"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !formData.username || !formData.password}
              className="py-4 rounded-2xl shadow-xl text-lg font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
            >
              {loading ? <CircularProgress size={24} className="text-white mr-2" /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <Divider className="my-8" />
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            disabled={loading}
            className="py-3 rounded-2xl border-2 font-semibold hover:bg-gray-50"
          >
            Already have an account? Sign In
          </Button>
        </Box>
      </Container>
    </div>
  );
}
