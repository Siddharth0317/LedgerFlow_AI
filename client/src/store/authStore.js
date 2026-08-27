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

    const storedToken = localStorage.getItem('agentflow_token');
    const storedUser = localStorage.getItem('agentflow_user');

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
        localStorage.setItem('agentflow_user', JSON.stringify(verifiedUser));
        set({
          user: verifiedUser,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to verify token');
      }
    } catch (err) {
      console.warn('Authentication token verification failed:', err.message);
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Authenticate user with email and password
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

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
        'Login failed. Please check your credentials.';

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });

      return { success: false, error: message };
    }
  },

  /**
   * Register a new user account
   */
  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      const { token, user } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

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
