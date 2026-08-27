import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Initial loading true to prevent flickers before checkAuth
  error: null,

  /**
   * Initialize and verify stored token from localStorage
   */
  checkAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const storedToken =
      localStorage.getItem('ledgerflow_token') || localStorage.getItem('agentflow_token');
    const storedUser =
      localStorage.getItem('ledgerflow_user') || localStorage.getItem('agentflow_user');

    if (!storedToken) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      if (storedUser) {
        set({ user: JSON.parse(storedUser), token: storedToken, isAuthenticated: true });
      }

      // Verify token with backend /auth/me
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.user) {
        const verifiedUser = response.data.user;
        localStorage.setItem('ledgerflow_user', JSON.stringify(verifiedUser));
        localStorage.setItem('ledgerflow_token', storedToken);
        set({
          user: verifiedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch (e) {
      console.warn('Token verification failed:', e.message);
      localStorage.removeItem('ledgerflow_token');
      localStorage.removeItem('ledgerflow_user');
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  /**
   * Authenticate user with email and password
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Support both (email, password) or ({ email, password })
      const payload =
        typeof credentials === 'string'
          ? { email: arguments[0], password: arguments[1] }
          : credentials;

      const response = await api.post('/auth/login', payload);
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('ledgerflow_token', token);
        localStorage.setItem('ledgerflow_user', JSON.stringify(user));
      }

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please verify credentials.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Register a new user account
   */
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('ledgerflow_token', token);
        localStorage.setItem('ledgerflow_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        'Registration failed. Please verify your details.';

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });

      return { success: false, error: message };
    }
  },

  /**
   * Clear user session and logout
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ledgerflow_token');
      localStorage.removeItem('ledgerflow_user');
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Reset active error state
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
