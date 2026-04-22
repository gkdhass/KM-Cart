/**
 * @file client/src/utils/api.js
 * @description Axios instance with base URL configuration and request/response interceptors.
 * Automatically attaches JWT token to all outgoing requests.
 * Handles 401 responses by redirecting to login.
 */

import axios from 'axios';

/**
 * Base URL for API requests.
 * - Development: '/api' (Vite proxy forwards to localhost:5000)
 * - Production:  VITE_API_URL env var (e.g. 'https://your-backend.onrender.com')
 *
 * Set VITE_API_URL in hosting dashboard → Environment Variables
 * Example: VITE_API_URL = https://your-backend.onrender.com
 * NOTE: Do NOT include /api in the env var — it's appended automatically.
 */
const rawUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = rawUrl
  ? `${rawUrl.replace(/\/+$/, '')}/api`
  : '/api';

/**
 * Pre-configured Axios instance for all API calls.
 * Includes:
 * - Base URL pointing to /api (proxied to Express server)
 * - JSON content type
 * - 10-second timeout
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request interceptor: Attach JWT token to every outgoing request.
 * Reads the token from localStorage and adds it as a Bearer token
 * in the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gkcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle common error responses globally.
 * - 401 Unauthorized: Clear stored auth data (token expired or invalid)
 * - Network errors: Provide user-friendly message
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Token expired or invalid — clear auth state
        localStorage.removeItem('gkcart_token');
        localStorage.removeItem('gkcart_user');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          // Dispatch a custom event that AuthContext can listen to
          window.dispatchEvent(new Event('auth:expired'));
        }
      }
    } else if (error.request) {
      // Request made but no response (network error)
      console.error('Network error — no response received');
    }

    return Promise.reject(error);
  }
);

export default api;
