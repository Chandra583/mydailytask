import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Session expiry time: 2 hours in milliseconds
const SESSION_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages user authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Logout function - clears auth-related session storage only
   */
  const logout = useCallback(() => {
    // Clear only auth-related sessionStorage items
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
    // Also clear any debug items that might be stored
    sessionStorage.removeItem('debug');
    setUser(null);
  }, []);

  /**
   * Check if session has expired
   */
  const isSessionExpired = useCallback(() => {
    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) return true;
    
    const elapsed = Date.now() - parseInt(loginTime, 10);
    return elapsed > SESSION_EXPIRY_TIME;
  }, []);

  // Check session on mount and set up periodic check
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (token && savedUser && loginTime) {
      // Check if session has expired
      if (isSessionExpired()) {
        console.log('Session expired - logging out');
        logout();
      } else {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);

    // Set up periodic session check every minute
    const intervalId = setInterval(() => {
      if (sessionStorage.getItem('token') && isSessionExpired()) {
        console.log('Session expired - auto logout');
        logout();
        window.location.href = '/login';
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isSessionExpired, logout]);

  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Use sessionStorage with login timestamp
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Register function
   */
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      const { token, ...userData } = response.data;
      
      // Use sessionStorage with login timestamp
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };


  const googleLogin = async (credentialResponse) => {
    try {
      // Decode the JWT to get user info
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(window.atob(base64));

      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });

      const { token, ...userData } = response.data;

      // Use sessionStorage with login timestamp
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('loginTime', Date.now().toString());
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed',
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
