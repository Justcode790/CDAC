/**
 * SUVIDHA 2026 - Authentication Context
 * 
 * Manages authentication state and user information across the application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getStoredToken, logout as logoutService } from '../services/authService';
import { getCurrentUser } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Verify token is still valid by fetching current user
          try {
            const response = await getCurrentUser();
            setUser(response.user);
          } catch (error) {
            // Token invalid, clear auth
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  // Helper functions to check user role
  const isCitizen = () => user?.role === ROLES.PUBLIC;
  const isOfficer = () => user?.role === ROLES.OFFICER;
  const isAdmin = () => user?.role === ROLES.ADMIN;
  const isSuperAdmin = () => user?.role === ROLES.SUPER_ADMIN;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout: handleLogout,
    updateUser,
    isCitizen,
    isOfficer,
    isAdmin,
    isSuperAdmin
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
