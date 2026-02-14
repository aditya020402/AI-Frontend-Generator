import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, Link, Stack, IconButton, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Person, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        username: formData.username,
        password: formData.password
      });
      
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setSuccess('Account created successfully!');
      onRegister?.(data.user);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 0l-6.849 6.849m0 0l-6.849-6.849m6.849 6.849V21m0 0h7.5M12 21v-7.5M5.636 5.636l6.849 6.849m0 0l6.849-6.849" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-center text-sm text-gray-600">
            Join thousands of developers building with AI
          </p>
        </div>

        <Paper elevation={8} className="card p-8 shadow-2xl">
          {error && (
            <Alert severity="error" className="mb-6 rounded-xl" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" className="mb-6 rounded-xl" icon={<span className="text-lg">✅</span>}>
              {success}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Person className="h-5 w-5 text-gray-400" />
                </div>
                <TextField
                  name="username"
                  required
                  fullWidth
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <TextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    size="small"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <TextField
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    size="small"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading || !formData.username || !formData.password}
              className="btn-primary !text-base !font-semibold !py-4 !rounded-xl !shadow-lg !hover:shadow-xl !transform !hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </Paper>

        {/* Login Link */}
        <div className="text-center">
          <Divider className="my-6" />
          <p className="text-sm text-gray-600 mb-4">
            Already have an account?
          </p>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            className="!border-gray-300 !text-gray-700 !hover:bg-gray-50 !hover:border-gray-400 !rounded-xl !py-3 !font-medium hover:shadow-md transition-all duration-200"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
