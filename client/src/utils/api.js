import axios from 'axios';

/**
 * API Configuration
 * 
 * SWITCHING BETWEEN LOCAL AND PRODUCTION:
 * ========================================
 * 
 * Option 1: Use environment variables (RECOMMENDED)
 * - For LOCAL: Create .env file with VITE_API_URL=http://localhost:5000/api
 * - For PRODUCTION: Set VITE_API_URL in Netlify dashboard
 * 
 * Option 2: Uncomment/comment the line below to switch manually
 */

// ============================================================
// MANUAL URL CONFIGURATION (Uncomment ONE of the lines below)
// ============================================================

// PRODUCTION (Vercel Backend)
// const API_BASE_URL = 'https://mydailytask.vercel.app/api';

// LOCAL DEVELOPMENT
// const API_BASE_URL = 'http://localhost:5000/api';

// AUTO-DETECT (Uses environment variable, falls back to production URL)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mydailytask.vercel.app/api';

// ============================================================

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout for production
  timeout: 10000,
});

// Log which API we're connecting to (only in development)
if (import.meta.env.DEV) {
  console.log('🔌 API Base URL:', API_BASE_URL);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth session storage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('loginTime');
      sessionStorage.removeItem('debug');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
