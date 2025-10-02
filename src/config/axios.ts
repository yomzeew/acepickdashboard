import axios from 'axios';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Simple retry function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance with base URL from environment
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://www.acepickdev.com',
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acepick_admin_token');
    console.log('Token found:', token ? 'YES' : 'NO');
    console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
    } else {
      console.warn('No authentication token found in localStorage');
    }
    
    console.log('Making request to:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (axios.isCancel(error)) {
      console.log('Request was cancelled:', error.message);
      return Promise.reject(error);
    }
    
    // Retry logic for timeout and network errors
    if (
      (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') &&
      originalRequest &&
      !originalRequest._retry &&
      (originalRequest._retryCount || 0) < MAX_RETRIES
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      console.log(`Retrying request... Attempt ${originalRequest._retryCount}/${MAX_RETRIES}`);
      
      await delay(RETRY_DELAY * originalRequest._retryCount);
      return apiClient(originalRequest);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API server may be slow or unreachable');
      return Promise.reject(new Error('Request timeout - please try again or check your connection'));
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('acepick_admin_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
