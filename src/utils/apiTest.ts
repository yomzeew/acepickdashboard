import apiClient from '../config/axios';
import axios from 'axios';

// Simple API test function to diagnose network issues
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('Base URL:', import.meta.env.VITE_API_URL || 'https://www.acepickdev.com');
    console.log('Token:', localStorage.getItem('acepick_admin_token') ? 'Present' : 'Missing');
    
    // Test a simple endpoint
    const response = await apiClient.get('/api/admin/client/all');
    console.log('API Test Success:', response.status);
    return response;
  } catch (error: any) {
    console.error('API Test Failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      cancelled: error.code === 'ERR_CANCELED',
      timeout: error.code === 'ECONNABORTED'
    });
    throw error;
  }
};

// Test server connectivity without authentication
export const testServerConnectivity = async () => {
  const baseURL = import.meta.env.VITE_API_URL || 'https://www.acepickdev.com';
  
  try {
    console.log('Testing server connectivity...');
    
    // Try a simple GET request to the base URL
    const response = await axios.get(baseURL, { timeout: 10000 });
    console.log('Server is reachable:', response.status);
    return true;
  } catch (error: any) {
    console.error('Server connectivity test failed:', {
      message: error.message,
      code: error.code,
      timeout: error.code === 'ECONNABORTED'
    });
    return false;
  }
};
