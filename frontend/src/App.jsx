import React, { useState, useEffect, useCallback } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Components
import Login from './components/Login';
import Register from './components/Register';
import LibraryDashboard from './components/LibraryDashboard';
import EditorLayout from './components/EditorLayout';
import { useComponentStore } from './stores/componentStore';

// Auth Context Provider
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Optional: Verify token with backend
          setUser({ id: 'initialized' });
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setInitializing(false);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const value = {
    user,
    login,
    logout,
    loading: loading || initializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/register', { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress size={48} className="text-primary-600" />
      </div>
    );
  }

  return user ? children : null;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  return user ? <Navigate to="/" replace /> : children;
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <LibraryDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/:id" 
          element={
            <ProtectedRoute>
              <EditorLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/new" 
          element={
            <ProtectedRoute>
              <EditorLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    secondary: { main: '#10b981' },
    background: {
      default: '#f9fafb',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { 
      textTransform: 'none',
      fontWeight: 600 
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
