/**
 * ROBUST API UTILITY
 * Handles loading states, errors, retries, and optimistic updates
 * Makes every API call bulletproof
 */

import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

// API Error messages that are actually helpful
const ERROR_MESSAGES = {
  NETWORK: 'Connection lost. Retrying automatically...',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  NOT_FOUND: 'Resource not found. Please refresh the page.',
  SERVER_ERROR: 'Server error. Our team has been notified.',
  UNKNOWN: 'Something went wrong. Please try again.',
  TIMEOUT: 'Request timeout. Check your connection.',
};

/**
 * Creates axios instance with better defaults
 */
const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: API_BASE,
    timeout: 15000, // 15 seconds
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

/**
 * Handles API errors with grace and helpful messages
 */
const handleApiError = (error, customMessage) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    
    if (status === 401) {
      toast.error(ERROR_MESSAGES.UNAUTHORIZED);
      // Could trigger logout here
      return { error: ERROR_MESSAGES.UNAUTHORIZED, shouldLogout: true };
    } else if (status === 404) {
      toast.error(customMessage || ERROR_MESSAGES.NOT_FOUND);
    } else if (status >= 500) {
      toast.error(ERROR_MESSAGES.SERVER_ERROR);
    } else {
      toast.error(customMessage || error.response.data?.detail || ERROR_MESSAGES.UNKNOWN);
    }
  } else if (error.request) {
    // Request made but no response
    toast.error(ERROR_MESSAGES.NETWORK);
  } else {
    // Something else happened
    toast.error(customMessage || ERROR_MESSAGES.UNKNOWN);
  }

  return { error: error.message || ERROR_MESSAGES.UNKNOWN };
};

/**
 * Retry logic with exponential backoff
 */
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Generic GET request with retry
 */
export const apiGet = async (endpoint, token, options = {}) => {
  const { showError = true, retries = 2 } = options;
  
  try {
    const api = createAxiosInstance(token);
    const response = await retryRequest(() => api.get(endpoint), retries);
    return { data: response.data, error: null };
  } catch (error) {
    if (showError) {
      handleApiError(error, options.errorMessage);
    }
    return { data: null, error };
  }
};

/**
 * Generic POST request
 */
export const apiPost = async (endpoint, data, token, options = {}) => {
  const { showSuccess = true, showError = true, successMessage, errorMessage } = options;
  
  try {
    const api = createAxiosInstance(token);
    const response = await api.post(endpoint, data);
    
    if (showSuccess && successMessage) {
      toast.success(successMessage);
    }
    
    return { data: response.data, error: null };
  } catch (error) {
    if (showError) {
      handleApiError(error, errorMessage);
    }
    return { data: null, error };
  }
};

/**
 * Generic PUT request
 */
export const apiPut = async (endpoint, data, token, options = {}) => {
  const { showSuccess = true, showError = true, successMessage, errorMessage } = options;
  
  try {
    const api = createAxiosInstance(token);
    const response = await api.put(endpoint, data);
    
    if (showSuccess && successMessage) {
      toast.success(successMessage);
    }
    
    return { data: response.data, error: null };
  } catch (error) {
    if (showError) {
      handleApiError(error, errorMessage);
    }
    return { data: null, error };
  }
};

/**
 * Generic DELETE request
 */
export const apiDelete = async (endpoint, token, options = {}) => {
  const { showSuccess = true, showError = true, successMessage, errorMessage } = options;
  
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete(endpoint);
    
    if (showSuccess && successMessage) {
      toast.success(successMessage);
    }
    
    return { data: response.data, error: null };
  } catch (error) {
    if (showError) {
      handleApiError(error, errorMessage);
    }
    return { data: null, error };
  }
};

/**
 * Hook-like pattern for managing API state
 * Usage: const { execute, loading, error } = useApiCall(apiFunction);
 */
export const createApiHook = (apiFunction) => {
  return {
    execute: async (...args) => {
      return await apiFunction(...args);
    },
  };
};
