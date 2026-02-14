import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App'; // Your context
import {
  Container, TextField, Button, Typography,
  Box, Alert, IconButton, InputAdornment, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext); // ✅ Your context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData,
        { timeout: 10000 }
      );

      const { token, user } = response.data;
      
      // Store globally
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update context (triggers redirect)
      login({ token, ...user });
      
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <Container maxWidth="sm">
        <Box className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-md mx-auto w-full">
          <Typography 
            variant="h3" 
            className="font-bold text-gray-900 text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Welcome Back
          </Typography>
          <Typography className="text-gray-600 text-center mb-8">
            Sign in to your account
          </Typography>
          
          {error && <Alert severity="error" className="mb-6 rounded-2xl">{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mb-6"
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
              className="py-4 rounded-2xl shadow-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? <CircularProgress size={24} className="text-white mr-2" /> : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <Divider className="my-8" />
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
            disabled={loading}
            className="py-3 rounded-2xl border-2 font-semibold hover:bg-blue-50"
          >
            Create New Account
          </Button>
        </Box>
      </Container>
    </div>
  );
}
