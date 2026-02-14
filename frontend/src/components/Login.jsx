import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography,
  Box, Alert, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      onLogin?.(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h2>
          <p className="text-center text-sm text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 shadow-2xl">
          {error && (
            <Alert severity="error" className="mb-6 rounded-xl shadow-sm" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Email className="h-5 w-5 text-gray-400" />
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    size="small"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading || !formData.username || !formData.password}
              className="btn-primary !text-base !font-semibold !py-4 !rounded-xl !shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <Divider className="my-6" />
          <p className="text-sm text-gray-600 mb-4">
            Don't have an account?
          </p>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
            className="!border-gray-300 !text-gray-700 !hover:bg-gray-50 !hover:border-gray-400 !rounded-xl !py-3 !font-medium hover:shadow-md transition-all duration-200"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}
