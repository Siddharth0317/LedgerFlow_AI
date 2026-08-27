import axios from 'axios';

let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Ensure base URL always includes /api prefix
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL: rawUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth expiration & errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          localStorage.removeItem('agentflow_token');
          localStorage.removeItem('agentflow_user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
