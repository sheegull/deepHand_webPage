// API configuration
const getApiBaseUrl = (): string => {
  // Check if there's a custom API URL set via environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development environment (localhost)
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:8787';
  }
  
  // Production environment
  return 'https://deephand-forms-production.sheegull.workers.dev';
};

export const API_ENDPOINTS = {
  contact: `${getApiBaseUrl()}/api/contact`,
  requestData: `${getApiBaseUrl()}/api/request-data`,
} as const;

// Helper function for API calls with error handling
export const apiCall = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};