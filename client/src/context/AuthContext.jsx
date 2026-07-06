/**
 * @file client/src/context/AuthContext.jsx
 * @description React Context for JWT-based authentication state management.
 * Provides user session data, login/logout functions, and auto-restores
 * sessions from localStorage on page reload.
 *
 * Usage: Wrap app with <AuthProvider>, then use useAuth() hook in components.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/** Auth context with default null values */
const AuthContext = createContext(null);

/** LocalStorage keys for persisting auth state */
const TOKEN_KEY = 'gkcart_token';
const USER_KEY = 'gkcart_user';

/**
 * AuthProvider component — wraps the app to provide auth state globally.
 * Handles:
 * - Session restoration from localStorage on mount
 * - Login (stores JWT + user data)
 * - Register (creates account, stores JWT + user data)
 * - Logout (clears all auth data)
 * - Listening for auth:expired events from Axios interceptor
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while restoring session

  /**
   * Restore session from localStorage on initial mount.
   * Then validate/refresh user data from database via /api/auth/me.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Fetch fresh user data from database to ensure role is up-to-date
          try {
            const response = await api.get('/auth/me');
            if (response.data.success && response.data.user) {
              const freshUser = response.data.user;
              setUser(freshUser);
              localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            }
          } catch (error) {
            // If /me fails, keep using localStorage data (token might be expired)
            console.warn('Failed to fetch fresh user data:', error.message);
          }
        }
      } catch (error) {
        // If stored data is corrupted, clear it
        console.error('Failed to restore session:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Listen for auth:expired events dispatched by Axios interceptor.
   * Automatically logs out user when their token expires.
   */
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  /**
   * Login with email and password.
   * Sends POST /api/auth/login and stores the returned JWT + user.
   *
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} { success, message, user }
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data.data;

      // Store in state
      setUser(userData);
      setToken(authToken);

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return { success: true, message: response.data.message, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  /**
   * Register a new account.
   * Sends POST /api/auth/register and stores the returned JWT + user.
   *
   * @param {String} name - User's full name
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} { success, message, user }
   */
  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user: userData, token: authToken } = response.data.data;

      // Store in state
      setUser(userData);
      setToken(authToken);

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return { success: true, message: response.data.message, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  /**
   * Logout the current user.
   * Clears all auth state and localStorage data.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  /**
   * Update the user object in context and localStorage.
   * Used after profile updates.
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  /**
   * Login or register via Google OAuth.
   * Sends Google user data to backend and stores returned JWT + user.
   */
  const googleLogin = useCallback(async (googleData) => {
    try {
      const response = await api.post('/auth/google', googleData);
      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return { success: true, message: response.data.message, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed.';
      return { success: false, message };
    }
  }, []);

  /** Computed property: is the user currently authenticated? */
  const isAuthenticated = !!user && !!token;

  /** Computed property: is the user an admin? */
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Context value exposed to consumers
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context.
 * Must be used within an AuthProvider.
 *
 * @returns {Object} { user, token, loading, isAuthenticated, login, register, logout }
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
