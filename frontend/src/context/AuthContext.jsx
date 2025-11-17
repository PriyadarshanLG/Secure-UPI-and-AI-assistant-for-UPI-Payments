import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

// Demo user for direct access (no login required)
const DEMO_USER = {
  _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
  name: 'Demo User',
  email: 'demo@secureme.com',
  role: 'customer',
  phone: '+91-9876543210',
};

export const AuthProvider = ({ children }) => {
  // Auto-login with demo user
  const [user, setUser] = useState(DEMO_USER);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('demo-token');

  useEffect(() => {
    // Auto-set demo user on mount
    setUser(DEMO_USER);
    setLoading(false);
  }, []);

  const fetchUser = async () => {
    // Skip real API call, use demo user
    setUser(DEMO_USER);
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });
      const { accessToken, user: userData } = response.data;
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


